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

        public AdminReportController(ILawyerDetailReportService lawyerDetailReportService)
        {
            _lawyerDetailReportService = lawyerDetailReportService;
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
    }