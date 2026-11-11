namespace ApiProspeccaoGSO.DTOs.Usuarios;

public sealed class UsuarioResumoDto
{
    public int Id { get; init; }
    public string? Nome { get; init; }
    public string? Email { get; init; }
    public string? Nivel { get; init; }
}
