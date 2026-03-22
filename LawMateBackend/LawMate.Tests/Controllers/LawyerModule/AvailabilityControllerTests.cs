using LawMate.API.Controllers.LawyerModule;
using LawMate.Application.LawyerModule.LawyerAvailability.Commands;
using LawMate.Application.LawyerModule.LawyerAvailability.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.LawyerModule
{
    public class AvailabilityControllerTests
    {
        private readonly Mock<IMediator> _mockMediator = new();
        private readonly AvailabilityController _controller;

        public AvailabilityControllerTests()
        {
            _controller = new AvailabilityController(_mockMediator.Object);
        }

        #region GetLawyerAvailabilitySlots

        [Fact]
        public async Task GetLawyerAvailabilitySlots_ReturnsOk_WithData()
        {
            // Arrange
            var slots = new List<GetAvailabilitySlotDto>
            {
                new GetAvailabilitySlotDto { TimeSlotId = 1, LawyerId = "L1" }
            };

            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetLawyerAvailabilitySlotsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(slots);

            // Act
            var result = await _controller.GetLawyerAvailabilitySlots("L1");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(slots, okResult.Value);
        }

        [Fact]
        public async Task GetLawyerAvailabilitySlots_ThrowsArgumentException_ReturnsBadRequest()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetLawyerAvailabilitySlotsQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new ArgumentException("Invalid"));

            var result = await _controller.GetLawyerAvailabilitySlots("L1");

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Invalid", badRequest.Value.ToString());
        }

        #endregion

        #region GetAvailabilitySlotById

        [Fact]
        public async Task GetAvailabilitySlotById_ReturnsOk_WithData()
        {
            var slot = new GetAvailabilitySlotDto { TimeSlotId = 1, LawyerId = "L1" };

            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetAvailabilitySlotByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(slot);

            var result = await _controller.GetAvailabilitySlotById(1);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(slot, ok.Value);
        }

        [Fact]
        public async Task GetAvailabilitySlotById_ThrowsKeyNotFound_ReturnsNotFound()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetAvailabilitySlotByIdQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new KeyNotFoundException("Not found"));

            var result = await _controller.GetAvailabilitySlotById(999);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Not found", notFound.Value.ToString());
        }

        #endregion

        #region CreateAvailabilitySlot

        [Fact]
        public async Task CreateAvailabilitySlot_ReturnsOk_WithId()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<CreateAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            var dto = new CreateAvailabilitySlotDto { LawyerId = "L1", StartTime = "09:00", Date = DateTime.Today, Duration = 60 };

            var result = await _controller.CreateAvailabilitySlot(dto);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("TimeSlotId", ok.Value.ToString());
        }

        [Fact]
        public async Task CreateAvailabilitySlot_ThrowsKeyNotFound_ReturnsNotFound()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<CreateAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new KeyNotFoundException("Not found"));

            var dto = new CreateAvailabilitySlotDto { LawyerId = "L1" };

            var result = await _controller.CreateAvailabilitySlot(dto);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Not found", notFound.Value.ToString());
        }

        [Fact]
        public async Task CreateAvailabilitySlot_ThrowsInvalidOperation_ReturnsBadRequest()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<CreateAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Invalid"));

            var dto = new CreateAvailabilitySlotDto { LawyerId = "L1" };

            var result = await _controller.CreateAvailabilitySlot(dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Invalid", badRequest.Value.ToString());
        }

        #endregion

        #region UpdateAvailabilitySlot

        [Fact]
        public async Task UpdateAvailabilitySlot_ReturnsOk()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<UpdateAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MediatR.Unit.Value);

            var dto = new UpdateAvailabilitySlotDto { Duration = 60 };

            var result = await _controller.UpdateAvailabilitySlot(1, dto);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("updated successfully", ok.Value.ToString());
        }

        [Fact]
        public async Task UpdateAvailabilitySlot_ThrowsKeyNotFound_ReturnsNotFound()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<UpdateAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new KeyNotFoundException("Not found"));

            var dto = new UpdateAvailabilitySlotDto { Duration = 60 };

            var result = await _controller.UpdateAvailabilitySlot(1, dto);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Not found", notFound.Value.ToString());
        }

        [Fact]
        public async Task UpdateAvailabilitySlot_ThrowsInvalidOperation_ReturnsBadRequest()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<UpdateAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Invalid"));

            var dto = new UpdateAvailabilitySlotDto { Duration = 60 };

            var result = await _controller.UpdateAvailabilitySlot(1, dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Invalid", badRequest.Value.ToString());
        }

        #endregion

        #region DeleteAvailabilitySlot

        [Fact]
        public async Task DeleteAvailabilitySlot_ReturnsOk()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<DeleteAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(MediatR.Unit.Value);

            var result = await _controller.DeleteAvailabilitySlot(1);

            var ok = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("deleted successfully", ok.Value.ToString());
        }

        [Fact]
        public async Task DeleteAvailabilitySlot_ThrowsKeyNotFound_ReturnsNotFound()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<DeleteAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new KeyNotFoundException("Not found"));

            var result = await _controller.DeleteAvailabilitySlot(1);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Not found", notFound.Value.ToString());
        }

        [Fact]
        public async Task DeleteAvailabilitySlot_ThrowsInvalidOperation_ReturnsBadRequest()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<DeleteAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Invalid"));

            var result = await _controller.DeleteAvailabilitySlot(1);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Contains("Invalid", badRequest.Value.ToString());
        }

        #endregion
    }
}