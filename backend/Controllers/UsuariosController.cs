using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Npgsql;
using Dapper;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;
using ApiProspeccaoGSO.DTOs.Shared;
using ApiProspeccaoGSO.DTOs.Usuarios;

namespace ApiProspeccaoGSO.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    [Authorize(Roles = "Admin")]
    public class UsuariosController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly ILogger<UsuariosController> _logger;

        public UsuariosController(IConfiguration configuration, ILogger<UsuariosController> logger)
        {
            _connectionString = configuration.GetConnectionString("DbProspeccao")
                ?? throw new System.InvalidOperationException("Connection string não encontrada.");
            _logger = logger;
        }

        // 1. CADASTRAR
        [HttpPost("cadastrar")]
        public async Task<IActionResult> Cadastrar([FromBody] CriarUsuarioDto model)
        {
            try
            {
                // Criptografa a senha antes de salvar
                string senhaCriptografada = GerarHashSha256(model.Senha.Trim());

                using var conn = new NpgsqlConnection(_connectionString);
                var sql = @"INSERT INTO vendedores (nome, email, senha_hash, nivel) VALUES (@Nome, @Email, @Senha, @Nivel)";
                await conn.ExecuteAsync(sql, new { Nome = model.Nome, Email = model.Email, Senha = senhaCriptografada, Nivel = model.Nivel });
                return Ok(new ApiUserMessageDto { Mensagem = "Usuário cadastrado com sucesso!" });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Falha ao cadastrar usuário.");
                return StatusCode(500, new ApiErrorDto { Erro = "Ocorreu um erro interno. Tente novamente." });
            }
        }

        // 2. LISTAR TODOS
        [HttpGet("listar")]
        public async Task<IActionResult> Listar()
        {
            try
            {
                using var conn = new NpgsqlConnection(_connectionString);
                var sql = "SELECT id AS Id, nome AS Nome, email AS Email, nivel AS Nivel FROM vendedores ORDER BY nome ASC";
                var usuarios = await conn.QueryAsync<UsuarioResumoDto>(sql);
                return Ok(usuarios);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Falha ao listar usuários.");
                return StatusCode(500, new ApiErrorDto { Erro = "Ocorreu um erro interno. Tente novamente." });
            }
        }

        // 3. EDITAR SENHA
        [HttpPut("{id}/senha")]
        public async Task<IActionResult> AlterarSenha(int id, [FromBody] AlterarSenhaDto model)
        {
            try
            {
                // Criptografa a NOVA senha antes de salvar
                string senhaCriptografada = GerarHashSha256(model.NovaSenha.Trim());

                using var conn = new NpgsqlConnection(_connectionString);
                var sql = "UPDATE vendedores SET senha_hash = @NovaSenha WHERE id = @Id";
                await conn.ExecuteAsync(sql, new { NovaSenha = senhaCriptografada, Id = id });
                return Ok(new ApiUserMessageDto { Mensagem = "Senha atualizada com segurança!" });
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "Falha ao alterar senha do usuário {UsuarioId}.", id);
                return StatusCode(500, new ApiErrorDto { Erro = "Ocorreu um erro interno. Tente novamente." });
            }
        }

        // 4. APAGAR USUÁRIO
        [HttpDelete("{id}")]
        public async Task<IActionResult> Apagar(int id)
        {
            try
            {
                using var conn = new NpgsqlConnection(_connectionString);
                var sql = "DELETE FROM vendedores WHERE id = @Id";
                await conn.ExecuteAsync(sql, new { Id = id });
                return Ok(new ApiUserMessageDto { Mensagem = "Usuário removido!" });
            }
            catch (System.Exception ex)
            {
                if (ex.Message.Contains("violates foreign key constraint"))
                    return BadRequest(new ApiErrorDto { Erro = "Não é possível apagar este colaborador pois ele possui empresas na sua carteira." });

                _logger.LogError(ex, "Falha ao apagar usuário {UsuarioId}.", id);
                return StatusCode(500, new ApiErrorDto { Erro = "Ocorreu um erro interno. Tente novamente." });
            }
        }

        // Função Mágica para HASH SHA-256
        private string GerarHashSha256(string texto)
        {
            using var sha256 = SHA256.Create();
            byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(texto));
            var builder = new StringBuilder();
            foreach (var b in bytes)
            {
                builder.Append(b.ToString("x2"));
            }
            return builder.ToString();
        }
    }
}
