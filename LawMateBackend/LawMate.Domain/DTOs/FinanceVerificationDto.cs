namespace LawMate.Domain.DTOs
{
    public class FinanceVerificationDto
    {
        public Guid Id { get; set; }

        public string LawyerName { get; set; }

        public string ServiceType { get; set; }

        public decimal TotalPayAmount { get; set; }

        public string Status { get; set; }
    }
}