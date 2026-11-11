namespace ApiProspeccaoGSO.DTOs.Prospeccao;

public sealed class EmpresaProspeccaoDto
{
    public string? CnpjCompleto { get; init; }
    public string? RazaoSocial { get; init; }
    public string? Rua { get; init; }
    public string? Numero { get; init; }
    public string? Complemento { get; init; }
    public string? Bairro { get; init; }
    public string? MunicipioNome { get; init; }
    public string? CnaeNome { get; init; }
    public string? VendedorDono { get; init; }
    public string? ClinicaAtual { get; init; }
    public string? Observacao { get; init; }
    public DateTime? DataAbertura { get; init; }
    public string? Porte { get; init; }
    public string? Telefone { get; init; }
    public string? Email { get; init; }
    public string? CnaeDescricao { get; init; }
    public string? Segmento { get; init; }
}
