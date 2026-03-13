using LawMate.Application.AdminModule;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities;

namespace LawMate.Infrastructure.Services
{
    public class FinanceService : IFinanceService
    {
        private static List<FinanceVerification> payments = new List<FinanceVerification>();

        // Constructor to add sample data
        public FinanceService()
        {
            if (!payments.Any())
            {
                payments.Add(new FinanceVerification
                {
                    Id = Guid.NewGuid(),
                    LawyerId = Guid.NewGuid(),
                    LawyerName = "Maya Wickramasinghe",
                    ServiceType = "Legal Consultation",
                    FeeAmount = 10000,
                    PlatformFee = 1500,
                    TotalPayAmount = 11500,
                    PaymentMethod = "Bank Transfer",
                    BankAccount = "Bank of Ceylon",
                    AccountNumber = "1234567890",
                    TransactionId = "TXN-001",
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                });

                payments.Add(new FinanceVerification
                {
                    Id = Guid.NewGuid(),
                    LawyerId = Guid.NewGuid(),
                    LawyerName = "Nimal Silva",
                    ServiceType = "Document Review",
                    FeeAmount = 8000,
                    PlatformFee = 1200,
                    TotalPayAmount = 9200,
                    PaymentMethod = "Bank Transfer",
                    BankAccount = "Commercial Bank",
                    AccountNumber = "9876543210",
                    TransactionId = "TXN-002",
                    Status = "Pending",
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        public async Task<List<FinanceVerificationDto>> GetPendingPayments()
        {
            return payments
                .Where(x => x.Status == "Pending")
                .Select(x => new FinanceVerificationDto
                {
                    Id = x.Id,
                    LawyerName = x.LawyerName,
                    ServiceType = x.ServiceType,
                    TotalPayAmount = x.TotalPayAmount,
                    Status = x.Status
                }).ToList();
        }

        public async Task<FinanceVerificationDto> GetPaymentDetails(Guid id)
        {
            var payment = payments.FirstOrDefault(x => x.Id == id);

            if (payment == null) return null;

            return new FinanceVerificationDto
            {
                Id = payment.Id,
                LawyerName = payment.LawyerName,
                ServiceType = payment.ServiceType,
                TotalPayAmount = payment.TotalPayAmount,
                Status = payment.Status
            };
        }

        public async Task<bool> ConfirmPayment(Guid id)
        {
            var payment = payments.FirstOrDefault(x => x.Id == id);

            if (payment == null)
                return false;

            payment.Status = "Confirmed";

            return true;
        }

        public async Task<bool> CancelPayment(Guid id)
        {
            var payment = payments.FirstOrDefault(x => x.Id == id);

            if (payment == null)
                return false;

            payment.Status = "Cancelled";

            return true;
        }
    }
}