using System.ComponentModel.DataAnnotations;

namespace ApiProspeccaoGSO.DTOs.Usuarios;

public sealed class AlterarSenhaDto
{
    [Required]
    public string NovaSenha { get; init; } = string.Empty;
}
