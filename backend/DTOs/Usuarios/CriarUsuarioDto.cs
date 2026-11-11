using System.ComponentModel.DataAnnotations;

namespace ApiProspeccaoGSO.DTOs.Usuarios;

public sealed class CriarUsuarioDto
{
    [Required]
    public string Nome { get; init; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Senha { get; init; } = string.Empty;

    [Required]
    public string Nivel { get; init; } = string.Empty;
}
