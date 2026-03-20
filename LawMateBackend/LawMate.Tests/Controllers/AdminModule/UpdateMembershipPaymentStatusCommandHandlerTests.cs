using LawMate.API.Controllers.AdminModule;
using LawMate.Application.AdminModule.PaymentMaintenance.Commands;
using LawMate.Application.AdminModule.PaymentMaintenance.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using UpdateMembershipPaymentStatusCommandHandler = LawMate.API.Controllers.AdminModule.UpdateMembershipPaymentStatusCommandHandler;

namespace LawMate.Tests.Controllers.AdminModule
{
    public class UpdateMembershipPaymentStatusCommandHandlerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly UpdateMembershipPaymentStatusCommandHandler _controller;

        public UpdateMembershipPaymentStatusCommandHandlerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new UpdateMembershipPaymentStatusCommandHandler(_mediatorMock.Object);

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
        public async Task GetAllPayments_ReturnsOkWithData()
        {
            var mockData = new List<PaymentDto>
            {
                new PaymentDto { TransactionId = "1", Amount = 5000, VerificationStatus = VerificationStatus.Pending }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPaymentsQuery>(), It.IsAny<CancellationToken>()))
                         .ReturnsAsync(mockData);

            var result = await _controller.GetAllPayments();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<List<PaymentDto>>(okResult.Value);
            Assert.Single(list);
            Assert.Equal(5000, list[0].Amount);
        }

        [Fact]
        public async Task GetPaymentDetails_ReturnsOkWithData()
        {
            var mockData = new PaymentDetailDto
            {
                TransactionId = "1",
                LawyerId = "lawyer1",
                Amount = 5000,
                PaymentType = "Booking"
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPaymentByIdQuery>(), It.IsAny<CancellationToken>()))
                         .ReturnsAsync(mockData);

            var result = await _controller.GetPaymentDetails("lawyer1", "booking", "client1");

            var okResult = Assert.IsType<OkObjectResult>(result);
            var dto = Assert.IsType<PaymentDetailDto>(okResult.Value);
            Assert.Equal("lawyer1", dto.LawyerId);
        }

        [Theory]
        [InlineData("GetPendingPayments", VerificationStatus.Pending)]
        [InlineData("GetAcceptedPayments", VerificationStatus.Verified)]
        [InlineData("GetRejectedPayments", VerificationStatus.Rejected)]
        public async Task GetPaymentsByStatus_ReturnsOk(string method, VerificationStatus status)
        {
            var mockData = new List<PaymentDto>
            {
                new PaymentDto { TransactionId = "021", VerificationStatus = status }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPaymentsQuery>(), It.IsAny<CancellationToken>()))
                         .ReturnsAsync(mockData);

            IActionResult result = method switch
            {
                "GetPendingPayments" => await _controller.GetPendingPayments(),
                "GetAcceptedPayments" => await _controller.GetAcceptedPayments(),
                "GetRejectedPayments" => await _controller.GetRejectedPayments(),
                _ => null
            };

            var okResult = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<List<PaymentDto>>(okResult.Value);
            Assert.Single(list);
            Assert.Equal(status, list[0].VerificationStatus);
        }

        [Fact]
        public async Task UpdateMembershipPayment_ReturnsOk()
        {
            var command = new UpdateMembershipPaymentStatusCommand
            {
                LawyerId = "69",
                Status = VerificationStatus.Verified
            };

            // Setup mediator to return a bool (true)
            _mediatorMock
                .Setup(m => m.Send(
                    It.IsAny<UpdateMembershipPaymentStatusCommand>(),
                    It.IsAny<CancellationToken>()))
                .ReturnsAsync(true); // ✅ return bool

            var result = await _controller.UpdateMembershipPayment(command);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.True((bool)okResult.Value); // ✅ cast result to bool
        }

        [Fact]
        public async Task UpdateBookingPayment_ReturnsOk()
        {
            var command = new UpdateBookingPaymentStatusCommand { BookingId = 1, Status = VerificationStatus.Verified };

            _mediatorMock.Setup(m => m.Send(command, default))
                .ReturnsAsync("Booking payment updated successfully");

            var result = await _controller.UpdateBookingPayment(command);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Booking payment updated successfully", okResult.Value);
        }


        [Fact]
        public async Task MarkBookingPaymentAsPaid_ReturnsOk()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<MarkBookingPaymentAsPaidCommand>(), It.IsAny<CancellationToken>()))
                         .ReturnsAsync("Payment marked as paid");

            var result = await _controller.MarkBookingPaymentAsPaid(1);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Payment marked as paid", okResult.Value);
        }
    }
}