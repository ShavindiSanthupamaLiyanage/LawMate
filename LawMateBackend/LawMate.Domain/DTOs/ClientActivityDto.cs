namespace LawMate.Domain.DTOs
{
    public class ClientActivityDto
    {
        public int BookingId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string CaseNumber { get; set; } = string.Empty;
        public string LawyerName { get; set; } = string.Empty;
        public string LawyerDetails { get; set; } = string.Empty;
        public byte[]? LawyerImage { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime FiledDate { get; set; }
    }
}