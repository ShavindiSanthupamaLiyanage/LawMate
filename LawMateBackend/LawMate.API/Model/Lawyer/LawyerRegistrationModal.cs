using LawMate.Domain.Common.Enums;
using Microsoft.EntityFrameworkCore;

namespace LawMate.API.Model.Lawyer
{
    public class LawyerRegistrationModal
    {
        public string UserId { get; set; }

        // USER_DETAIL
        public Prefix Prefix { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? NIC { get; set; }
        public string? ContactNumber { get; set; }
        public Gender Gender { get; set; }
        public UserRole UserRole { get; set; }
        public string? Password { get; set; }
        public int? RecordStatus { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public State State { get; set; }
        public IFormFile? ProfileImage { get; set; }

        // LAWYER_DETAILS
        public string? SCECertificateNo { get; set; }
        public string? Bio { get; set; }
        public int YearOfExperience { get; set; }
        public District WorkingDistrict { get; set; }
        public AreaOfPractice AreaOfPractice { get; set; }
        public decimal AverageRating { get; set; }
        public VerificationStatus VerificationStatus { get; set; }
        public bool? BarAssociationMembership { get; set; }
        public string? BarAssociationRegNo { get; set; }
        public string? ProfessionalDesignation { get; set; }
        public string? OfficeContactNumber { get; set; }
        public IFormFile? EnrollmentCertificate { get; set; }
        public IFormFile? NICFrontImage { get; set; }
        public IFormFile? NICBackImage { get; set; }
    }
}
