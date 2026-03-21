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
        public string? SCECertificateNo { get; set; }
        public string? Bio { get; set; }
        public bool? BarAssociationMembership { get; set; }
        public string? BarAssociationRegNo { get; set; }
        public string? ProfessionalDesignation { get; set; }
        public int YearOfExperience { get; set; }
        public District WorkingDistrict { get; set; }
        public AreaOfPractice AreaOfPractice { get; set; }
        public string? OfficeContactNumber { get; set; }
        [Precision(3, 2)]
        public decimal AverageRating { get; set; }
        public byte[]? EnrollmentCertificate { get; set; }
        public byte[]? NICFrontImage { get; set; }
        public byte[]? NICBackImage { get; set; }
        public VerificationStatus VerificationStatus { get; set; }
        public string? VerifiedBy { get; set; }
        public DateTime? VerifiedAt { get; set; }
        public string? RejectedReason { get; set; }
    }
}
