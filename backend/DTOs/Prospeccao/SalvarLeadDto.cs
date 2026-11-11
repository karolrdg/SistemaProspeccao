using System.ComponentModel.DataAnnotations;

namespace ApiProspeccaoGSO.DTOs.Prospeccao;

public sealed class SalvarLeadDto
{
    [Required]
    public string Cnpj { get; init; } = string.Empty;

    public string ClinicaAtual { get; init; } = string.Empty;
    public string Observacao { get; init; } = string.Empty;
}
