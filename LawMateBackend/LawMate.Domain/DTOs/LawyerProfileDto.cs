namespace LawMate.Domain.DTOs;

public class LawyerProfileDto
{
    public string LawyerId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? ProfileImageBase64 { get; set; }
    public string AreaOfPractice { get; set; } = string.Empty;
    public string? ProfessionalDesignation { get; set; }
    public int YearOfExperience { get; set; }
    public double AverageRating { get; set; }
}