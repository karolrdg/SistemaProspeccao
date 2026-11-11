namespace ApiProspeccaoGSO.DTOs.Auth;

public sealed class UsuarioAutenticacaoDto
{
    public int Id { get; init; }
    public string? Nome { get; init; }
    public string? Email { get; init; }
    public string? Nivel { get; init; }
    public string? SenhaHash { get; init; }
}
