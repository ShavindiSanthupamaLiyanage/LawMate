namespace LawMate.Domain.DTOs;

public class LawyerDetailReportDto
{
        public string    UserId               { get; set; }
        public string Prefix               { get; set; } 
        public string FirstName            { get; set; } 
        public string LastName             { get; set; } 
        public string Email                { get; set; } 
        public string ContactNumber        { get; set; } 
        public string Gender               { get; set; } 
        public string NIC                  { get; set; } 
        public DateTime?  RegistrationDate   { get; set; }
        public DateTime? LastLoginDate     { get; set; }
        public string State                { get; set; } 
        public string  SCECertificateNo           { get; set; } 
        public string  Bio                        { get; set; } 
        public string  ProfessionalDesignation    { get; set; } 
        public int     YearOfExperience           { get; set; }
        public string  WorkingDistrict            { get; set; } 
        public string  AreaOfPractice             { get; set; } 
        public string  OfficeContactNumber        { get; set; } 
        public bool  BarAssociationMembership   { get; set; } 
        public string  BarAssociationRegNo        { get; set; } 
        public decimal AverageRating              { get; set; }
        public string  VerificationStatus         { get; set; } 
        public DateTime? VerifiedAt               { get; set; }
        public string  VerifiedBy                 { get; set; } 
        public string  RejectedReason             { get; set; } 
        public DateTime? MembershipStartDate { get; set; }
        public DateTime? MembershipEndDate   { get; set; }
        public bool?     MembershipExpired   { get; set; }
}