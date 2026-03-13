using Microsoft.AspNetCore.Mvc;
using LawMate.Application.AdminModule;

namespace LawMate.API.Controllers.AdminModule
{
    [ApiController]
    [Route("api/admin/finance")]
    public class FinanceController : ControllerBase
    {
        private readonly IFinanceService _financeService;

        public FinanceController(IFinanceService financeService)
        {
            _financeService = financeService;
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingPayments()
        {
            var result = await _financeService.GetPendingPayments();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentDetails(Guid id)
        {
            var result = await _financeService.GetPaymentDetails(id);
            return Ok(result);
        }

        [HttpPost("confirm/{id}")]
        public async Task<IActionResult> ConfirmPayment(Guid id)
        {
            var result = await _financeService.ConfirmPayment(id);
            return Ok(result);
        }

        [HttpPost("cancel/{id}")]
        public async Task<IActionResult> CancelPayment(Guid id)
        {
            var result = await _financeService.CancelPayment(id);
            return Ok(result);
        }
    }
}