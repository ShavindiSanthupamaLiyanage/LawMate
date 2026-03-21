using System.Security.Claims;
using FluentAssertions;
using LawMate.API.Controllers.AdminModule;
using LawMate.Application.Common.Interfaces.AdminReports;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.AdminModule;

public class AdminReportControllerTests
{
    private readonly Mock<ILawyerDetailReportService> _lawyerService = new();
    private readonly Mock<IClientDetailReportService> _clientService = new();
    private readonly Mock<IMembershipRenewalReportService> _membershipService = new();
    private readonly Mock<IPlatformCommissionReportService> _platformService = new();
    private readonly Mock<IMonthlyRevenueReportService> _monthlyService = new();
    private readonly Mock<IFinancialSummaryReportService> _financialService = new();

    private readonly AdminReportController _controller;

    public AdminReportControllerTests()
    {
        _controller = new AdminReportController(
            _lawyerService.Object,
            _clientService.Object,
            _membershipService.Object,
            _platformService.Object,
            _monthlyService.Object,
            _financialService.Object
        );

        // Mock User Identity
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, "test-user")
        }, "mock"));

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }
    
    [Fact]
    public async Task DownloadLawyerDetailReport_ShouldReturnFile()
    {
        var bytes = new byte[] { 1, 2, 3 };

        _lawyerService
            .Setup(x => x.GenerateLawyerDetailReportAsync(It.IsAny<string>()))
            .ReturnsAsync(bytes);

        var result = await _controller.DownloadLawyerDetailReport();

        var fileResult = result as FileContentResult;

        fileResult.Should().NotBeNull();
        fileResult.ContentType.Should().Be("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        fileResult.FileContents.Should().BeEquivalentTo(bytes);
    }
    
    [Fact]
    public async Task DownloadLawyerDetailReport_ShouldReturnBadRequest_WhenEmpty()
    {
        _lawyerService
            .Setup(x => x.GenerateLawyerDetailReportAsync(It.IsAny<string>()))
            .ReturnsAsync(Array.Empty<byte>());

        var result = await _controller.DownloadLawyerDetailReport();

        result.Should().BeOfType<BadRequestObjectResult>();
    }
    
    [Fact]
    public async Task DownloadLawyerDetailReport_ShouldReturn500_WhenExceptionThrown()
    {
        _lawyerService
            .Setup(x => x.GenerateLawyerDetailReportAsync(It.IsAny<string>()))
            .ThrowsAsync(new Exception("fail"));

        var result = await _controller.DownloadLawyerDetailReport();

        var objectResult = result as ObjectResult;

        objectResult.Should().NotBeNull();
        objectResult.StatusCode.Should().Be(500);
    }
    
    [Fact]
    public async Task DownloadClientDetailReport_ShouldReturnFile()
    {
        var bytes = new byte[] { 1, 2, 3 };

        _clientService
            .Setup(x => x.GenerateClientDetailReportAsync(It.IsAny<string>()))
            .ReturnsAsync(bytes);

        var result = await _controller.DownloadClientDetailReport();

        var fileResult = result as FileContentResult;

        fileResult.Should().NotBeNull();
        fileResult.FileContents.Should().BeEquivalentTo(bytes);
    }
    
    [Fact]
    public async Task DownloadMembershipRenewalReport_ShouldReturnFile()
    {
        var bytes = new byte[] { 5, 6, 7 };

        _membershipService
            .Setup(x => x.GenerateMembershipRenewalReportAsync(It.IsAny<string>()))
            .ReturnsAsync(bytes);

        var result = await _controller.DownloadMembershipRenewalReport();

        result.Should().BeOfType<FileContentResult>();
    }
    
    [Fact]
    public async Task DownloadPlatformCommissionReport_ShouldReturnFile()
    {
        _platformService
            .Setup(x => x.GeneratePlatformCommissionReportAsync(It.IsAny<string>()))
            .ReturnsAsync(new byte[] { 1 });

        var result = await _controller.DownloadPlatformCommissionReport();

        result.Should().BeOfType<FileContentResult>();
    }
    
    [Fact]
    public async Task DownloadMonthlyRevenueReport_ShouldReturnFile()
    {
        _monthlyService
            .Setup(x => x.GenerateMonthlyRevenueReportAsync(It.IsAny<string>()))
            .ReturnsAsync(new byte[] { 1 });

        var result = await _controller.DownloadMonthlyRevenueReport();

        result.Should().BeOfType<FileContentResult>();
    }
    
    [Fact]
    public async Task DownloadFinancialSummaryReport_ShouldReturnFile()
    {
        _financialService
            .Setup(x => x.GenerateFinancialSummaryReportAsync(It.IsAny<string>()))
            .ReturnsAsync(new byte[] { 1 });

        var result = await _controller.DownloadFinancialSummaryReport();

        result.Should().BeOfType<FileContentResult>();
    }
}