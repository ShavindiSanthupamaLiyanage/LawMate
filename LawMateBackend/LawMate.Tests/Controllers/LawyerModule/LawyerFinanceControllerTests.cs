using System.Security.Claims;
using LawMate.API.Controllers.LawyerModule;
using LawMate.Application.LawyerModule.LawyerFinance.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.LawyerModule
{
    public class LawyerFinanceControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly LawyerFinanceController _controller;

        public LawyerFinanceControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new LawyerFinanceController(_mediatorMock.Object);
        }

        private void SetUser(string? userId)
        {
            var claims = userId != null
                ? new[] { new Claim("UserId", userId) }
                : Array.Empty<Claim>();

            var identity = new ClaimsIdentity(claims, "TestAuth");
            var user = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task GetOverview_ShouldReturnOk()
        {
            SetUser("lawyer-1");
            
            _mediatorMock.Setup(m => m.Send(
                    It.IsAny<GetLawyerFinanceOverviewQuery>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(new LawyerFinanceOverviewDto { TotalEarnings = 100 });

            var result = await _controller.GetOverview();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);

            _mediatorMock.Verify(m => m.Send(
                It.Is<GetLawyerFinanceOverviewQuery>(q => q.LawyerId == "lawyer-1"),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetTransactions_ShouldReturnOk()
        {
            SetUser("lawyer-2");

            _mediatorMock.Setup(m => m.Send(
                    It.IsAny<GetLawyerFinanceTransactionsQuery>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<LawyerFinanceTransactionItemDto>()); 
            var result = await _controller.GetTransactions("test", VerificationStatus.Verified);

            var okResult = Assert.IsType<OkObjectResult>(result);

            _mediatorMock.Verify(m => m.Send(
                It.Is<GetLawyerFinanceTransactionsQuery>(q =>
                    q.LawyerId == "lawyer-2" &&
                    q.Search == "test" &&
                    q.Status == VerificationStatus.Verified),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetDashboard_ShouldReturnOk()
        {
            SetUser("lawyer-3");

            _mediatorMock.Setup(m => m.Send(
                    It.IsAny<GetLawyerFinanceDashboardQuery>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(new LawyerFinanceDashboardDto()); 

            var result = await _controller.GetDashboard();

            var okResult = Assert.IsType<OkObjectResult>(result);

            _mediatorMock.Verify(m => m.Send(
                It.Is<GetLawyerFinanceDashboardQuery>(q => q.LawyerId == "lawyer-3"),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetReport_ShouldReturnOk()
        {
            SetUser("lawyer-4");

            var start = DateTime.UtcNow.AddDays(-7);
            var end = DateTime.UtcNow;

            _mediatorMock.Setup(m => m.Send(
                    It.IsAny<GetLawyerEarningsReportQuery>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(new LawyerEarningsReportDto()); 

            var result = await _controller.GetReport(start, end, "weekly");

            var okResult = Assert.IsType<OkObjectResult>(result);

            _mediatorMock.Verify(m => m.Send(
                It.Is<GetLawyerEarningsReportQuery>(q =>
                    q.LawyerId == "lawyer-4" &&
                    q.StartDate == start &&
                    q.EndDate == end &&
                    q.Preset == "weekly"),
                It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task GetOverview_ShouldThrowException_WhenUserIdMissing()
        {
            SetUser(null);

            var ex = await Assert.ThrowsAsync<Exception>(() => _controller.GetOverview());

            Assert.Equal("Unable to identify current lawyer", ex.Message);
        }
    }
}