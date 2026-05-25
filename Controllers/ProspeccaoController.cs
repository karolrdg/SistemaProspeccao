using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.Collections.Generic;
using System.Text;
using System;
using System.Threading.Tasks;
using Npgsql;
using Dapper;

namespace ApiProspeccaoGSO.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProspeccaoController : ControllerBase
    {
        private readonly string _connectionString;

        public ProspeccaoController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DbProspeccao")
                ?? throw new InvalidOperationException("Connection string não encontrada.");
        }

        [HttpGet("empresas")]
        public async Task<IActionResult> BuscarEmpresas(
            [FromQuery] string municipio,
            [FromQuery] string? cnae,
            [FromQuery] string? palavraCnae,
            [FromQuery] string? porte,
            [FromQuery] string? ordenacao,
            [FromQuery] bool incluirInativas,
            [FromQuery] string? segmento,
            [FromQuery] string? capital)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                var sql = new StringBuilder();
                var parametros = new DynamicParameters();

                parametros.Add("Municipio", municipio);

                sql.Append(@"
                    SELECT 
                        e.cnpj_basico || e.cnpj_ordem || e.cnpj_dv AS CnpjCompleto,
                        emp.razao_social AS RazaoSocial,
                        e.logradouro AS Rua,
                        e.numero AS Numero,
                        e.complemento AS Complemento,
                        e.bairro AS Bairro,
                        CASE WHEN m.descricao = '' OR m.descricao IS NULL THEN e.municipio ELSE m.descricao END AS MunicipioNome,
                        CASE WHEN c.descricao = '' OR c.descricao IS NULL THEN e.cnae_fiscal_principal ELSE c.descricao END AS CnaeNome,
                        v.nome AS VendedorDono,
                        f.clinica_atual AS ClinicaAtual,
                        f.historico_observacoes AS Observacao,
                        e.data_inicio_atividade AS DataAbertura,
                        emp.porte_empresa AS Porte,
                        COALESCE(NULLIF(CONCAT(e.ddd_1, e.telefone_1), ''), 'Sem Telefone') AS Telefone,
                        COALESCE(NULLIF(e.email, ''), 'Sem E-mail') AS Email,
                        c.descricao AS CnaeDescricao,
                        cs.novo_seguimento AS Segmento
                    FROM estabelecimentos e
                    INNER JOIN empresas emp ON e.cnpj_basico = emp.cnpj_basico
                    LEFT JOIN municipios m ON e.municipio = m.codigo
                    LEFT JOIN cnaes c ON e.cnae_fiscal_principal::varchar = c.codigo::varchar
                    LEFT JOIN funil_prospeccao f ON f.cnpj_completo = (e.cnpj_basico || e.cnpj_ordem || e.cnpj_dv)
                    LEFT JOIN vendedores v ON v.id = f.vendedor_id
                    LEFT JOIN cnaes_simplificados cs ON e.cnae_fiscal_principal::varchar = cs.subclasse::varchar
                    WHERE e.municipio = @Municipio");

                if (!incluirInativas)
                {
                    sql.Append(" AND e.situacao_cadastral = '02'");
                }

                if (!string.IsNullOrEmpty(cnae))
                {
                    sql.Append(" AND e.cnae_fiscal_principal::varchar = @Cnae");
                    parametros.Add("Cnae", cnae);
                }

                if (!string.IsNullOrEmpty(palavraCnae))
                {
                    sql.Append(" AND c.descricao ILIKE @PalavraCnae");
                    parametros.Add("PalavraCnae", $"%{palavraCnae}%");
                }

                if (!string.IsNullOrEmpty(porte))
                {
                    sql.Append(" AND emp.porte_empresa::varchar = @Porte");
                    parametros.Add("Porte", porte);
                }

                if (!string.IsNullOrEmpty(segmento))
                {
                    sql.Append(" AND cs.novo_seguimento ILIKE @Segmento");
                    parametros.Add("Segmento", $"%{segmento}%");
                }

                if (!string.IsNullOrEmpty(capital))
                {
                    string campoCapital = "REPLACE(COALESCE(NULLIF(emp.capital_social, ''), '0'), ',', '.')::numeric";

                    if (capital == "ate_10k")
                        sql.Append($" AND {campoCapital} <= 10000");
                    else if (capital == "10k_50k")
                        sql.Append($" AND {campoCapital} > 10000 AND {campoCapital} <= 50000");
                    else if (capital == "50k_100k")
                        sql.Append($" AND {campoCapital} > 50000 AND {campoCapital} <= 100000");
                    else if (capital == "100k_500k")
                        sql.Append($" AND {campoCapital} > 100000 AND {campoCapital} <= 500000");
                    else if (capital == "mais_500k")
                        sql.Append($" AND {campoCapital} > 500000");
                }

                if (ordenacao == "mais_novas")
                {
                    sql.Append(" ORDER BY e.data_inicio_atividade DESC");
                }
                else
                {
                    sql.Append(" ORDER BY e.data_inicio_atividade ASC");
                }

                sql.Append(" LIMIT 500;");

                var empresas = await connection.QueryAsync<dynamic>(sql.ToString(), parametros);
                return Ok(empresas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("segmentos")]
        public async Task<IActionResult> BuscarSegmentosMacro()
        {
            try
            {
                using var conn = new NpgsqlConnection(_connectionString);
                var sql = @"
                    SELECT DISTINCT novo_seguimento
                    FROM cnaes_simplificados
                    WHERE novo_seguimento IS NOT NULL
                      AND novo_seguimento <> ''
                    ORDER BY novo_seguimento ASC;";
                var segmentos = await conn.QueryAsync(sql);
                return Ok(segmentos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        [HttpPost("autorizar")]
        public async Task<IActionResult> AutorizarLeads([FromBody] List<LeadRequest> requests)
        {
            try
            {
                var vendedorEmail = User.FindFirstValue(ClaimTypes.Email);
                var nivelUsuario = User.FindFirstValue(ClaimTypes.Role);

                using var conn = new NpgsqlConnection(_connectionString);

                var vendedorId = await conn.QueryFirstOrDefaultAsync<int>(
                    "SELECT id FROM vendedores WHERE email = @email", new { email = vendedorEmail });

                if (vendedorId == 0) return Unauthorized(new { erro = "Vendedor não encontrado." });

                foreach (var item in requests)
                {
                    var donoExistente = await conn.QueryFirstOrDefaultAsync<int?>(
                        "SELECT vendedor_id FROM funil_prospeccao WHERE cnpj_completo = @Cnpj",
                        new { Cnpj = item.Cnpj });

                    if (donoExistente.HasValue)
                    {
                        if (donoExistente.Value != vendedorId && nivelUsuario != "Admin")
                        {
                            return StatusCode(403, new { erro = "Esta empresa já pertence a outro vendedor." });
                        }

                        var sqlUpdate = @"
                            UPDATE funil_prospeccao 
                            SET clinica_atual = @ClinicaAtual, historico_observacoes = @Obs 
                            WHERE cnpj_completo = @Cnpj;";

                        await conn.ExecuteAsync(sqlUpdate, new
                        {
                            ClinicaAtual = item.ClinicaAtual ?? "",
                            Obs = item.Observacao ?? "",
                            Cnpj = item.Cnpj
                        });
                    }
                    else
                    {
                        var sqlInsert = @"
                            INSERT INTO funil_prospeccao (cnpj_completo, vendedor_id, clinica_atual, historico_observacoes)
                            VALUES (@Cnpj, @VendedorId, @ClinicaAtual, @Obs);";

                        await conn.ExecuteAsync(sqlInsert, new
                        {
                            Cnpj = item.Cnpj,
                            VendedorId = vendedorId,
                            ClinicaAtual = item.ClinicaAtual ?? "",
                            Obs = item.Observacao ?? ""
                        });
                    }
                }

                return Ok(new { message = "Leads salvos com sucesso!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERRO FATAL AO SALVAR: {ex.Message}");
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        // --- NOVA FUNÇÃO: DESVINCULAR EMPRESA ---
        [HttpPost("liberar/{cnpj}")]
        public async Task<IActionResult> LiberarLead(string cnpj)
        {
            try
            {
                var vendedorEmail = User.FindFirstValue(ClaimTypes.Email);
                var nivelUsuario = User.FindFirstValue(ClaimTypes.Role);

                using var conn = new NpgsqlConnection(_connectionString);

                var vendedorId = await conn.QueryFirstOrDefaultAsync<int>(
                    "SELECT id FROM vendedores WHERE email = @email", new { email = vendedorEmail });

                // Confere de quem é a empresa hoje
                var donoExistente = await conn.QueryFirstOrDefaultAsync<int?>(
                    "SELECT vendedor_id FROM funil_prospeccao WHERE cnpj_completo = @Cnpj",
                    new { Cnpj = cnpj });

                if (!donoExistente.HasValue)
                    return BadRequest(new { erro = "Esta empresa já está livre no sistema." });

                // Regra de segurança: Só libera se for o próprio dono ou um Admin
                if (donoExistente.Value != vendedorId && nivelUsuario != "Admin")
                {
                    return StatusCode(403, new { erro = "Você não tem permissão para liberar a empresa de outro vendedor." });
                }

                // Apaga o vínculo e a observação (devolve pro mar limpa)
                await conn.ExecuteAsync("DELETE FROM funil_prospeccao WHERE cnpj_completo = @Cnpj", new { Cnpj = cnpj });

                return Ok(new { message = "Empresa liberada com sucesso!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }
    }

    public class LeadRequest
    {
        public string Cnpj { get; set; } = string.Empty;
        public string ClinicaAtual { get; set; } = string.Empty;
        public string Observacao { get; set; } = string.Empty;
    }
}