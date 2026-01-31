using LawMate.Domain.Common.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Domain.DTOs
{
    public class CreateAdminDto
    {
        public string? UserId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? UserName { get; set; }
        public UserRole UserRole { get; set; }
        public string? Email { get; set; }
        public string? NIC { get; set; }
        public string? Password { get; set; }
        public string? ContactNumber { get; set; }
        public int? RecordStatus { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public State State { get; set; }
        public byte[]? ProfileImage { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
}
