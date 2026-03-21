using System;

namespace LawMate.Domain.DTOs.Lawyer
{
    public class LawyerActivityDto
    {
        public int BookingId { get; set; }
        public string Title { get; set; }
        public string CaseNumber { get; set; }
        public string ClientName { get; set; }
        public string Status { get; set; }
        public DateTime? FiledDate { get; set; }
        public string? ClientImage { get; set; }
    }
}