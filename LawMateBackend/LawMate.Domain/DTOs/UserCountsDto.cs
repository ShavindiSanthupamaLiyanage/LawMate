namespace LawMate.Domain.DTOs;

public class UserCountsDto
{
    public int VerifiedLawyers { get; set; }
    public int PendingLawyers { get; set; }
    public int InactiveLawyers { get; set; }
    public int ActiveLawyers { get; set; }

    public int ActiveClients { get; set; }
    public int InactiveClients { get; set; }
}