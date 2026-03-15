using Microsoft.AspNetCore.Http;

namespace LawMate.Domain.DTOs
{
    public class CreateClientDto
    {
        public string? Prefix { get; set; }          // "Mr."
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        public string? Gender { get; set; }          // "male"
        public string? Email { get; set; }
        public string? NIC { get; set; }
        public string? ContactNumber { get; set; }

        public string? Address { get; set; }
        public string? District { get; set; }

        public string? PreferredLanguage { get; set; } // "english"
        public string? Password { get; set; }
        public IFormFile? ProfileImage { get; set; } 
    }
}