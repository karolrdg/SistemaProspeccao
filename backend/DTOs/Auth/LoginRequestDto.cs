using System.ComponentModel.DataAnnotations;

namespace ApiProspeccaoGSO.DTOs.Auth;

public sealed class LoginRequestDto
{
    [Required, EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Senha { get; init; } = string.Empty;
}
