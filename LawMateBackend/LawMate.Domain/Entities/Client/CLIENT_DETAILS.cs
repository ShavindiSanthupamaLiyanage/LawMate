using LawMate.Domain.Common.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Domain.Entities.Auth
{
    public class CLIENT_DETAILS
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; }
        public string? Address { get; set; }
        public string? District { get; set; }
        public Language PrefferedLanguage { get; set; }
    }
}
