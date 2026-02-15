using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Domain.Entities.Auth
{
    public class USER_DETAIL : AuditEntity
    {
        public string UserId { get; private set; }
        public Prefix Prefix { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? UserName { get; set; }
        public UserRole UserRole { get; set; }
        public Gender Gender { get; set; }
        public string? Email { get; set; }
        public string? NIC { get; set; }
        public string? Password { get; set; }
        public string? ContactNumber { get; set; }
        public int? RecordStatus { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public State State { get; set; }
        public byte[]? ProfileImage { get; set; }
        public bool IsDualAccount { get; set; }
    }
}
