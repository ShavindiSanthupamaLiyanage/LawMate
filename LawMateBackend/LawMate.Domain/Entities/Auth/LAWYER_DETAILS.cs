using LawMate.Domain.Common.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Domain.Entities.Auth
{
    public class LAWYER_DETAILS
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; }
        public string? BarAssociationRegNo { get; set; }
        public string? Bio { get; set; }
        public int YearOfExperience { get; set; }
        [Precision(3, 2)]
        public decimal AverageRating { get; set; }
        public VerificationStatus VerificationStatus { get; set; }
        public string? VerifiedBy { get; set; }
        public DateTime? VerifiedAt { get; set; }
    }
}
