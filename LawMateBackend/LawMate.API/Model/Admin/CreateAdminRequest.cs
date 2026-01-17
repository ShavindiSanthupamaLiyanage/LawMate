using LawMate.Domain.Common.Enums;

namespace LawMate.API.Model.Admin
{
    public class CreateAdminRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? NIC { get; set; }
        public string? Password { get; set; }
        public string? PhoneNumber { get; set; }
        public int? RecordStatus { get; set; }
        public State State { get; set; }
        public IFormFile? ProfileImage { get; set; }
    }
}
