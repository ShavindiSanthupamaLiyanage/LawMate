using LawMate.Domain.DTOs;

namespace LawMate.Application.AdminModule
{
    public interface IFinanceService
    {
        Task<List<FinanceVerificationDto>> GetPendingPayments();

        Task<FinanceVerificationDto> GetPaymentDetails(Guid id);

        Task<bool> ConfirmPayment(Guid id);

        Task<bool> CancelPayment(Guid id);
    }
}