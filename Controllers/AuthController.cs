using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using System.Security.Cryptography;
using Npgsql;
using Dapper;

namespace ApiProspeccaoGSO.Controllers
{
    [ApiController]
    [Route("api/auth")]
    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly string _jwtKey;

        public AuthController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DbProspeccao")
                ?? throw new Exception("String de conexão não encontrada.");
            _jwtKey = configuration["JwtSettings:SecretKey"]
                ?? "ChaveSuperSecretaDaGSOMedicinaOcupacional2026";
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                Console.WriteLine($"\n--- TENTATIVA DE LOGIN ---");
                Console.WriteLine($"Email recebido: '{request.Email}'");

                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Senha))
                {
                    return BadRequest(new { erro = "E-mail ou senha não foram enviados." });
                }

                using var conn = new NpgsqlConnection(_connectionString);

                var sql = "SELECT id AS Id, nome AS Nome, email AS Email, nivel AS Nivel, senha_hash AS Senha FROM vendedores WHERE email ILIKE @Email LIMIT 1";
                var usuario = await conn.QueryFirstOrDefaultAsync<VendedorModel>(sql, new { Email = request.Email });

                if (usuario == null)
                {
                    Console.WriteLine("ERRO: E-mail não encontrado no banco de dados.");
                    return Unauthorized(new { erro = "E-mail ou senha incorretos." }); // Mensagem genérica por segurança
                }

                string senhaBanco = usuario.Senha ?? "";

                // Criptografa a senha que o usuário digitou para comparar com a do banco
                string senhaHasheada = GerarHashSha256(request.Senha.Trim());

                if (senhaBanco.Trim() != senhaHasheada)
                {
                    Console.WriteLine("ERRO: Senha não bate com o Hash do banco de dados.");
                    return Unauthorized(new { erro = "E-mail ou senha incorretos." });
                }

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_jwtKey);

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new[]
                    {
                        new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                        new Claim(ClaimTypes.Name, usuario.Nome ?? ""),
                        new Claim(ClaimTypes.Email, usuario.Email ?? ""),
                        new Claim(ClaimTypes.Role, usuario.Nivel ?? "Usuario")
                    }),
                    Expires = DateTime.UtcNow.AddHours(8),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                Console.WriteLine("SUCESSO: Login autorizado!\n");

                return Ok(new
                {
                    token = tokenString,
                    nome = usuario.Nome,
                    nivel = usuario.Nivel
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERRO FATAL: {ex.Message}");
                return StatusCode(500, new { erro = $"Erro interno: {ex.Message}" });
            }
        }

        // Função Mágica que transforma a senha em um código inquebrável
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

    public class LoginRequest
    {
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("senha")]
        public string Senha { get; set; } = string.Empty;
    }

    public class VendedorModel
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Nivel { get; set; } = "Usuario";
        public string Senha { get; set; } = string.Empty;
    }
}