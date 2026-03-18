using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

public class UserDetailResponseDto
{
    public string UserId { get; set; }
    public Prefix Prefix { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? UserName { get; set; }
    public Gender Gender { get; set; }
    public string? Email { get; set; }
    public string? NIC { get; set; }
    public string? ContactNumber { get; set; }
    public int? RecordStatus { get; set; }
    public int State { get; set; }
    public UserRole UserRole { get; set; }
    public bool IsDualAccount { get; set; }
}