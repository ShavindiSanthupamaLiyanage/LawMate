namespace LawMate.Domain.DTOs;

public class ClientDetailReportDto
{
    public string UserId { get; set; }
    public string Prefix { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string ContactNumber { get; set; }
    public string Gender { get; set; }
    public string NIC { get; set; }
    public DateTime? RegistrationDate { get; set; }
    public DateTime? LastLoginDate { get; set; }
    public string State { get; set; }

    public string Address { get; set; }
    public string District { get; set; }
    public string PreferredLanguage { get; set; }
}