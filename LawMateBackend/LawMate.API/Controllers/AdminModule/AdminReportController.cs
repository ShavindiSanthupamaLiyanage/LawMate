using LawMate.Application.Common.Interfaces.AdminReports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.AdminModule;

[Route("api/admin/reports")]
[ApiController]
// [Authorize] 
public class AdminReportController : ControllerBase
    {
        private readonly ILawyerDetailReportService _lawyerDetailReportService;
        private readonly IClientDetailReportService _clientDetailReportService;
        private readonly IMembershipRenewalReportService _membershipRenewalReportService;
        private readonly IPlatformCommissionReportService _platformReportService;
        private readonly IMonthlyRevenueReportService _monthlyRevenueReportService;

        public AdminReportController(ILawyerDetailReportService lawyerDetailReportService,
            IClientDetailReportService clientDetailReportService,
            IMembershipRenewalReportService membershipRenewalReportService,
            IPlatformCommissionReportService platformReportService,
            IMonthlyRevenueReportService monthlyRevenueReportService)
        {
            _lawyerDetailReportService = lawyerDetailReportService;
            _clientDetailReportService = clientDetailReportService;
            _membershipRenewalReportService = membershipRenewalReportService;
            _platformReportService = platformReportService;
            _monthlyRevenueReportService = monthlyRevenueReportService;
        }
        
        [HttpGet("lawyer-details")]
        public async Task<IActionResult> DownloadLawyerDetailReport()
        {
            try
            {
                var userId = User.Identity?.Name ?? "Unknown";

                var fileBytes = await _lawyerDetailReportService.GenerateLawyerDetailReportAsync(userId);

                if (fileBytes == null || fileBytes.Length == 0)
                {
                    return BadRequest(new { message = "No lawyer data found." });
                }

                var fileName = $"LawMate_LawyerDetailReport_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName
                );
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error." });
            }
        }
        
        [HttpGet("client-details")]
        public async Task<IActionResult> DownloadClientDetailReport()
        {
            var userId = User.Identity?.Name ?? "System";

            var fileBytes = await _clientDetailReportService.GenerateClientDetailReportAsync(userId);

            var fileName = $"LawMate_ClientDetailReport_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName
            );
        }
        
        [HttpGet("membership-renewals")]
        public async Task<IActionResult> DownloadMembershipRenewalReport()
        {
            var userId = User.Identity?.Name ?? "System";

            var fileBytes = await _membershipRenewalReportService.GenerateMembershipRenewalReportAsync(userId);

            var fileName = $"LawMate_MembershipRenewalReport_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName
            );
        }
        
        [HttpGet("platform-commission")]
        public async Task<IActionResult> DownloadPlatformCommissionReport()
        {
            var userId = User.Identity?.Name ?? "System";
            
            var fileBytes = await _platformReportService.GeneratePlatformCommissionReportAsync(userId);

            var fileName = $"LawMate_PlatformCommissionReport_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName
            );
        }
        
        [HttpGet("monthly-revenue")]
        public async Task<IActionResult> DownloadMonthlyRevenueReport()
        {
            var userId = User.Identity?.Name ?? "System";
            
            var fileBytes = await _monthlyRevenueReportService.GenerateMonthlyRevenueReportAsync(userId);

            var fileName = $"LawMate_MonthlyRevenueReport_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName
            );
            
        }
    }