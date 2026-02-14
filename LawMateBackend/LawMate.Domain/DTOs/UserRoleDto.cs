namespace LawMate.Domain.DTOs;

public class UserRoleDto
{
    public string UserId { get; set; }
    public string Role { get; set; }
    public bool IsDualAccount { get; set; }
}