using LawMate.Domain.Entities.Common;

namespace LawMate.Domain.Entities.User;

public class PASSWORD_RESET_TOKEN : AuditEntity
{
    public string UserId { get; set; } 
    public string Token { get; set; } 
    public DateTime ExpiryDate { get; set; }
    public bool IsUsed { get; set; }
}