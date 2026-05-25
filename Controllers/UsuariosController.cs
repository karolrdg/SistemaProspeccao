using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Npgsql;
using Dapper;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;

namespace ApiProspeccaoGSO.Controllers
{
    [ApiController]
    [Route("api/usuarios")]
    // [Authorize(Roles = "Admin")] <-- COMENTADO CORRETAMENTE PARA TESTE
    public class UsuariosController : ControllerBase
    {
        private readonly string _connectionString;

        public UsuariosController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DbProspeccao")
                ?? throw new System.InvalidOperationException("Connection string não encontrada.");
        }

        // 1. CADASTRAR
        [HttpPost("cadastrar")]
        public async Task<IActionResult> Cadastrar([FromBody] UsuarioDTO model)
        {
            try
            {
                // Criptografa a senha antes de salvar
                string senhaCriptografada = GerarHashSha256(model.Senha.Trim());

                using var conn = new NpgsqlConnection(_connectionString);
                var sql = @"INSERT INTO vendedores (nome, email, senha_hash, nivel) VALUES (@Nome, @Email, @Senha, @Nivel)";
                await conn.ExecuteAsync(sql, new { Nome = model.Nome, Email = model.Email, Senha = senhaCriptografada, Nivel = model.Nivel });
                return Ok(new { mensagem = "Usuário cadastrado com sucesso!" });
            }
            catch (System.Exception ex) { return StatusCode(500, new { erro = ex.Message }); }
        }

        // 2. LISTAR TODOS
        [HttpGet("listar")]
        public async Task<IActionResult> Listar()
        {
            try
            {
                using var conn = new NpgsqlConnection(_connectionString);
                var sql = "SELECT id, nome, email, nivel FROM vendedores ORDER BY nome ASC";
                var usuarios = await conn.QueryAsync(sql);
                return Ok(usuarios);
            }
            catch (System.Exception ex) { return StatusCode(500, new { erro = ex.Message }); }
        }

        // 3. EDITAR SENHA
        [HttpPut("{id}/senha")]
        public async Task<IActionResult> AlterarSenha(int id, [FromBody] AlterarSenhaDTO model)
        {
            try
            {
                // Criptografa a NOVA senha antes de salvar
                string senhaCriptografada = GerarHashSha256(model.NovaSenha.Trim());

                using var conn = new NpgsqlConnection(_connectionString);
                var sql = "UPDATE vendedores SET senha_hash = @NovaSenha WHERE id = @Id";
                await conn.ExecuteAsync(sql, new { NovaSenha = senhaCriptografada, Id = id });
                return Ok(new { mensagem = "Senha atualizada com segurança!" });
            }
            catch (System.Exception ex) { return StatusCode(500, new { erro = ex.Message }); }
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
                return Ok(new { mensagem = "Usuário removido!" });
            }
            catch (System.Exception ex)
            {
                if (ex.Message.Contains("violates foreign key constraint"))
                    return StatusCode(400, new { erro = "Não é possível apagar este colaborador pois ele possui empresas na sua carteira." });

                return StatusCode(500, new { erro = ex.Message });
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

    public class UsuarioDTO
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string Nivel { get; set; } = string.Empty;
    }

    public class AlterarSenhaDTO
    {
        public string NovaSenha { get; set; } = string.Empty;
    }
}