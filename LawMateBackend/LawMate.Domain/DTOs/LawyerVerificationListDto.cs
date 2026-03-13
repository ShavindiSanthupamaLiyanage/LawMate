using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

public class LawyerVerificationListDto
{
    public string UserId { get; set; }
    public string LawyerName { get; set; }
    public string SCECertificateNo { get; set; }
    public string BarAssociationRegNo { get; set; }
    public VerificationStatus VerificationStatus { get; set; }
    public byte[]? ProfileImage { get; set; }
}