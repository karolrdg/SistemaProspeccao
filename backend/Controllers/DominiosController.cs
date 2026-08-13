using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Npgsql;
using Dapper;

namespace ApiProspeccaoGSO.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous] // <--- A MÁGICA ESTÁ AQUI: Libera para os filtros carregarem sem erro 401
    public class DominiosController : ControllerBase
    {
        private readonly string _connectionString;

        public DominiosController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DbProspeccao")!;
        }

        [HttpGet("estados")]
        public async Task<IActionResult> GetEstados()
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = "SELECT DISTINCT uf FROM municipios WHERE uf IS NOT NULL ORDER BY uf";
            var estados = await conn.QueryAsync<string>(sql);
            return Ok(estados);
        }

        [HttpGet("cidades/{uf}")]
        public async Task<IActionResult> GetCidades(string uf)
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"SELECT codigo, 
                        CASE WHEN descricao = '' OR descricao IS NULL THEN codigo ELSE descricao END as descricao 
                        FROM municipios WHERE uf = @uf ORDER BY descricao";
            var cidades = await conn.QueryAsync(sql, new { uf });
            return Ok(cidades);
        }

        [HttpGet("cnaes")]
        public async Task<IActionResult> GetCnaes()
        {
            using var conn = new NpgsqlConnection(_connectionString);
            var sql = @"
                SELECT codigo, 
                       CASE WHEN descricao = '' OR descricao IS NULL THEN codigo ELSE descricao END as descricao 
                FROM cnaes 
                ORDER BY 
                       CASE WHEN descricao = '' OR descricao IS NULL THEN 1 ELSE 0 END, 
                       descricao";

            var cnaes = await conn.QueryAsync(sql);
            return Ok(cnaes);
        }
    }
}