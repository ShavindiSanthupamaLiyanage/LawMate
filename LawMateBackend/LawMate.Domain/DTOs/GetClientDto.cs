using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs
{
    public class GetClientDto
    {
        // USER_DETAIL
        public string UserId { get; set; } = default!;
        public Prefix Prefix { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public Gender Gender { get; set; }
        public string? Email { get; set; }
        public string? NIC { get; set; }
        public string? ContactNumber { get; set; }
        public int? RecordStatus { get; set; }
        public State State { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public byte[]? ProfileImage { get; set; }
        public bool IsDualAccount { get; set; }

        // CLIENT_DETAILS
        public string? Address { get; set; }
        public string? District { get; set; }
        public Language PrefferedLanguage { get; set; }
    }
}