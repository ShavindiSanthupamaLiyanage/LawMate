using LawMate.API.Controllers.ClientModule;
using LawMate.Application.ClientModule.ClientBookings.Commands;
using LawMate.Application.ClientModule.ClientBookings.Queries;
using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.ClientModule
{
    public class ClientPaymentControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ICurrentUserService> _userServiceMock;
        private readonly ClientPaymentController _controller;

        public ClientPaymentControllerTests()
        {
            _mediatorMock   = new Mock<IMediator>();
            _userServiceMock = new Mock<ICurrentUserService>();

            _userServiceMock.Setup(u => u.UserId).Returns("C1");

            _controller = new ClientPaymentController(
                _mediatorMock.Object,
                _userServiceMock.Object
            );
        }
        
        public class UploadSlipResponse
        {
            public int PaymentId { get; set; }
            public string Message { get; set; } = string.Empty;
        }

        // ─── UploadPaymentSlip Tests ────────────────────────────────────────────────

        [Fact]
        public async Task UploadPaymentSlip_Should_Return_BadRequest_When_Slip_Is_Missing()
        {
            var request = new UploadSlipRequest(1, "");

            var result = await _controller.UploadPaymentSlip(request);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("required", badRequest.Value.ToString()!, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task UploadPaymentSlip_Should_Return_Ok_On_Success()
        {
            var request = new UploadSlipRequest(1, "base64string");

            _mediatorMock.Setup(m => m.Send(It.IsAny<UploadPaymentSlipCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(10);

            var result = await _controller.UploadPaymentSlip(request);

            var ok = Assert.IsType<OkObjectResult>(result);

            // Convert the anonymous object to a known type for testing
            var response = System.Text.Json.JsonSerializer.Deserialize<UploadSlipResponse>(
                System.Text.Json.JsonSerializer.Serialize(ok.Value)
            );

            Assert.NotNull(response);
            Assert.Equal(10, response!.PaymentId);
            Assert.Contains("uploaded successfully", response.Message, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task UploadPaymentSlip_Should_Handle_NotFoundException()
        {
            var request = new UploadSlipRequest(1, "base64string");

            _mediatorMock.Setup(m => m.Send(It.IsAny<UploadPaymentSlipCommand>(), It.IsAny<CancellationToken>()))
                         .ThrowsAsync(new KeyNotFoundException("Booking not found"));

            var result = await _controller.UploadPaymentSlip(request);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Booking not found", notFound.Value.ToString()!);
        }

        [Fact]
        public async Task UploadPaymentSlip_Should_Handle_InvalidOperationException()
        {
            var request = new UploadSlipRequest(1, "base64string");

            _mediatorMock.Setup(m => m.Send(It.IsAny<UploadPaymentSlipCommand>(), It.IsAny<CancellationToken>()))
                         .ThrowsAsync(new InvalidOperationException("Duplicate slip"));

            var result = await _controller.UploadPaymentSlip(request);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Duplicate slip", badRequest.Value.ToString()!);
        }

        [Fact]
        public async Task UploadPaymentSlip_Should_Handle_UnauthorizedAccessException()
        {
            var request = new UploadSlipRequest(1, "base64string");

            _mediatorMock.Setup(m => m.Send(It.IsAny<UploadPaymentSlipCommand>(), It.IsAny<CancellationToken>()))
                         .ThrowsAsync(new UnauthorizedAccessException("Not authorized"));

            var result = await _controller.UploadPaymentSlip(request);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Contains("Not authorized", unauthorized.Value.ToString()!);
        }

        // ─── GetPaymentSlip Tests ───────────────────────────────────────────────────

        [Fact]
        public async Task GetPaymentSlip_Should_Return_Unauthorized_When_ClientId_Null()
        {
            _userServiceMock.Setup(u => u.UserId).Returns((string?)null);

            var result = await _controller.GetPaymentSlip(1);

            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Contains("could not be resolved", unauthorized.Value.ToString()!);
        }

        [Fact]
        public async Task GetPaymentSlip_Should_Return_NotFound_When_Result_Null()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPaymentSlipQuery>(), It.IsAny<CancellationToken>()))
                         .ReturnsAsync((PaymentSlipResultDto?)null);

            var result = await _controller.GetPaymentSlip(1);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("No payment slip", notFound.Value.ToString()!);
        }

        [Fact]
        public async Task GetPaymentSlip_Should_Return_Ok_When_Result_Exists()
        {
            var dto = new PaymentSlipResultDto
            {
                PaymentId = 1,
                SlipImageBase64 = "abc",
                VerificationStatus = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetPaymentSlipQuery>(), It.IsAny<CancellationToken>()))
                         .ReturnsAsync(dto);

            var result = await _controller.GetPaymentSlip(1);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(dto, ok.Value);
        }
    }
}