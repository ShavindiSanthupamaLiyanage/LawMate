namespace LawMate.Domain.DTOs;

public class MembershipRenewalReportDto
{
    public string UserId { get; set; }
    public string LawyerName { get; set; }
    public string Email { get; set; }
    public string ContactNumber { get; set; }

    public string WorkingDistrict { get; set; }
    public string AreaOfPractice { get; set; }
    public decimal AverageRating { get; set; }

    public DateTime? MembershipStartDate { get; set; }
    public DateTime? MembershipEndDate { get; set; }

    public decimal MembershipFee { get; set; }
    public string PaymentStatus { get; set; }
    public string VerificationStatus { get; set; }
    public bool IsExpired { get; set; }

    public int DaysUntilExpiry { get; set; }

    public string MembershipStatusLabel { get; set; }

    public int TotalRenewals { get; set; }
}