using System.ComponentModel.DataAnnotations;

namespace ApiProspeccaoGSO.DTOs.Prospeccao;

public sealed class BuscarEmpresasDto
{
    [Required]
    public string Municipio { get; init; } = string.Empty;

    public string? Cnae { get; init; }
    public string? PalavraCnae { get; init; }
    public string? Porte { get; init; }
    public string? Ordenacao { get; init; }
    public bool IncluirInativas { get; init; }
    public string? Segmento { get; init; }
    public string? Capital { get; init; }
}
