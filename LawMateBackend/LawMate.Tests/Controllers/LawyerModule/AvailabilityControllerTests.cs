using LawMate.API.Controllers.LawyerModule;
using LawMate.Application.LawyerModule.LawyerAvailability.Commands;
using LawMate.Application.LawyerModule.LawyerAvailability.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.LawyerModule;

public class AvailabilityControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly AvailabilityController _controller;

    public AvailabilityControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new AvailabilityController(_mediatorMock.Object);
    }

    [Fact]
    public async Task GetLawyerAvailabilitySlots_ShouldReturnOk_WithData()
    {
        var slots = new List<GetAvailabilitySlotDto>
        {
            new()
            {
                TimeSlotId = 1,
                Id = "1",
                Date = new DateTime(2026, 3, 20),
                StartTime = "09:00",
                Duration = 30,
                Price = 0
            }
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetLawyerAvailabilitySlotsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(slots);

        var startDate = new DateTime(2026, 3, 20);
        var endDate = new DateTime(2026, 3, 21);
        var result = await _controller.GetLawyerAvailabilitySlots("LAW002", startDate, endDate);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Same(slots, okResult.Value);

        _mediatorMock.Verify(m => m.Send(
            It.Is<GetLawyerAvailabilitySlotsQuery>(q =>
                q.LawyerId == "LAW002" &&
                q.StartDate == startDate &&
                q.EndDate == endDate),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetLawyerAvailabilitySlots_ShouldReturnBadRequest_WhenMediatorThrows()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetLawyerAvailabilitySlotsQuery>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("query failed"));

        var result = await _controller.GetLawyerAvailabilitySlots("LAW002");

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CreateAvailabilitySlot_ShouldReturnOk_WhenSuccessful()
    {
        var request = new CreateAvailabilitySlotDto
        {
            LawyerId = "LAW002",
            Date = new DateTime(2026, 3, 20),
            StartTime = "10:00",
            Duration = 30,
            Price = 5000
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<CreateAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(12);

        var result = await _controller.CreateAvailabilitySlot(request);

        Assert.IsType<OkObjectResult>(result);
        _mediatorMock.Verify(m => m.Send(
            It.Is<CreateAvailabilitySlotCommand>(c => c.Data == request),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAvailabilitySlot_ShouldReturnNotFound_WhenLawyerNotFound()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<CreateAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new KeyNotFoundException("Lawyer with ID LAW002 not found"));

        var result = await _controller.CreateAvailabilitySlot(new CreateAvailabilitySlotDto());

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task UpdateAvailabilitySlot_ShouldReturnOk_WhenSuccessful()
    {
        var request = new UpdateAvailabilitySlotDto
        {
            StartTime = "11:00",
            Duration = 45
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<UpdateAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Unit.Value);

        var result = await _controller.UpdateAvailabilitySlot(7, request);

        Assert.IsType<OkObjectResult>(result);
        _mediatorMock.Verify(m => m.Send(
            It.Is<UpdateAvailabilitySlotCommand>(c => c.TimeSlotId == 7 && c.Data == request),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAvailabilitySlot_ShouldReturnBadRequest_WhenInvalidOperationThrown()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<UpdateAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Cannot modify date or time of a booked slot"));

        var result = await _controller.UpdateAvailabilitySlot(7, new UpdateAvailabilitySlotDto());

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task DeleteAvailabilitySlot_ShouldReturnOk_WhenSuccessful()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<DeleteAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Unit.Value);

        var result = await _controller.DeleteAvailabilitySlot(15);

        Assert.IsType<OkObjectResult>(result);
        _mediatorMock.Verify(m => m.Send(
            It.Is<DeleteAvailabilitySlotCommand>(c => c.TimeSlotId == 15),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAvailabilitySlot_ShouldReturnBadRequest_WhenInvalidOperationThrown()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<DeleteAvailabilitySlotCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Cannot delete a booked time slot"));

        var result = await _controller.DeleteAvailabilitySlot(15);

        Assert.IsType<BadRequestObjectResult>(result);
    }
}

