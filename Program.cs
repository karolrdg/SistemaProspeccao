using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Libera o CORS para o navegador nao bloquear a tela.
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// 2. Habilita os Controllers para a API reconhecer as rotas.
builder.Services.AddControllers();

// 3. Puxa a MESMA chave do appsettings.json.
// 3. Puxa a MESMA chave das configurações (lê appsettings local ou as variáveis do Render).
var chaveJwt = builder.Configuration["JwtSettings:SecretKey"];

if (string.IsNullOrEmpty(chaveJwt))
{
    // Se não achar no JSON nem no painel, ele joga uma chave padrão segura temporária 
    // apenas para o Builder do Render não travar o deploy.
    chaveJwt = "ChaveProvisoriaDeSegurancaParaOBuilderNaoQuebrarODeploy2026";
}

// Converte usando UTF8 que é universal e aceita caracteres especiais sem corromper no Linux
var key = Encoding.UTF8.GetBytes(chaveJwt);

// 4. Configura a autenticacao JWT.
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// 5. Ativa as regras na ordem correta.
app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";
app.Urls.Add($"http://0.0.0.0:{port}");

app.Run();
