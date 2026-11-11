namespace ApiProspeccaoGSO.DTOs.Auth;

public sealed class LoginResponseDto
{
    public string Token { get; init; } = string.Empty;
    public string Nome { get; init; } = string.Empty;
    public string Nivel { get; init; } = string.Empty;
}
