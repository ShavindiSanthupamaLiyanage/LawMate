using LawMate.API.Controllers.AdminModule;
using LawMate.Application.AdminModule.AdminFinanceVerification.Queries;
using LawMate.Application.AdminModule.FinanceVerification.Commands;
using LawMate.Application.AdminModule.FinanceVerification.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace LawMate.Tests.Controllers.AdminModule
{
    public class FinanceControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly FinanceController _controller;

        public FinanceControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new FinanceController(_mediatorMock.Object);

            // Mock user identity
            var user = new System.Security.Claims.ClaimsPrincipal(
                new System.Security.Claims.ClaimsIdentity(
                    new[] { new System.Security.Claims.Claim(System.Security.Claims.ClaimTypes.Name, "admin123") }
                )
            );

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task GetAllFinance_ReturnsOkWithData()
        {
            var mockData = new List<LawyerFinanceSummaryDto>
            {
                new() { LawyerId = "lawyer1", TotalLawyerFee = 5000 }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllFinanceQuery>(), default))
                         .ReturnsAsync(mockData);

            var result = await _controller.GetAllFinance();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<List<LawyerFinanceSummaryDto>>(okResult.Value);
            Assert.Single(list);
            Assert.Equal("lawyer1", list[0].LawyerId);
        }

        [Fact]
        public async Task GetAllFinanceDetails_ReturnsOkWithData()
        {
            var mockData = new List<FinanceDetailsDto>
            {
                new()
                {
                    LawyerId = "lawyer1",
                    FullName = "Sunil Gamage",
                    BookingId = 1,
                    Amount = 5000
                }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllFinanceDetailsQuery>(), default))
                         .ReturnsAsync(mockData);

            var result = await _controller.GetAllFinanceDetails();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<List<FinanceDetailsDto>>(okResult.Value);
            Assert.Single(list);
            Assert.Equal(1, list[0].BookingId);
            Assert.Equal("lawyer1", list[0].LawyerId);
        }

        [Fact]
        public async Task GetPendingFinance_ReturnsOkWithData()
        {
            var mockData = new List<LawyerFinanceSummaryDto>
            {
                new() { LawyerId = "lawyer1", TotalLawyerFee = 4500 }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPendingFinanceQuery>(), default))
                         .ReturnsAsync(mockData);

            var result = await _controller.GetPendingFinance();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<List<LawyerFinanceSummaryDto>>(okResult.Value);
            Assert.Single(list);
        }

        [Fact]
        public async Task GetPaidFinance_ReturnsOkWithData()
        {
            var mockData = new List<LawyerFinanceSummaryDto>
            {
                new() { LawyerId = "lawyer1", TotalLawyerFee = 2700 }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPaidFinanceQuery>(), default))
                         .ReturnsAsync(mockData);

            var result = await _controller.GetPaidFinance();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<List<LawyerFinanceSummaryDto>>(okResult.Value);
            Assert.Single(list);
        }

        [Fact]
        public async Task ApproveFinance_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<ApproveFinancePaymentCommand>(), default))
                         .ReturnsAsync("Payment approved successfully");

            var result = await _controller.ApproveFinance(1, "SLIP123");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Payment approved successfully", okResult.Value);
        }

        [Fact]
        public async Task RejectFinance_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<RejectFinancePaymentCommand>(), default))
                         .ReturnsAsync("Payment rejected successfully");

            var result = await _controller.RejectFinance(1, "Invalid slip");

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Payment rejected successfully", okResult.Value);
        }
    }
}