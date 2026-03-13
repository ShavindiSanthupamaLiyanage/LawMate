namespace LawMate.Domain.Entities
{
    public class FinanceVerification
    {
        public Guid Id { get; set; }

        public Guid LawyerId { get; set; }

        public string LawyerName { get; set; }

        public string ServiceType { get; set; }

        public decimal FeeAmount { get; set; }

        public decimal PlatformFee { get; set; }

        public decimal TotalPayAmount { get; set; }

        public string PaymentMethod { get; set; }

        public string BankAccount { get; set; }

        public string AccountNumber { get; set; }

        public string TransactionId { get; set; }

        public string Status { get; set; } // Pending / Confirmed / Cancelled

        public DateTime CreatedAt { get; set; }
    }
}