using LawMate.API.Controllers.LawyerModule;
using LawMate.Application.LawyerModule.LawyerEvent.Commands;
using LawMate.Application.LawyerModule.LawyerEvent.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.LawyerModule;

public class LawyerEventControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly LawyerEventController _controller;

    public LawyerEventControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new LawyerEventController(_mediatorMock.Object);
    }

    [Fact]
    public async Task GetLawyerEvents_ShouldReturnOk_WithData()
    {
        var events = new List<GetLawyerEventDto>
        {
            new()
            {
                EventId = 3,
                EventCode = "EVT-0003",
                LawyerId = "LAW002",
                Title = "Court Appearance",
                EventType = "Court",
                DateTime = new DateTime(2026, 3, 20, 9, 0, 0),
                Duration = 120,
                Mode = "Physical"
            }
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetLawyerEventsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(events);

        var startDate = new DateTime(2026, 3, 20);
        var endDate = new DateTime(2026, 3, 21);
        var result = await _controller.GetLawyerEvents("LAW002", startDate, endDate);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Same(events, okResult.Value);

        _mediatorMock.Verify(m => m.Send(
            It.Is<GetLawyerEventsQuery>(q =>
                q.LawyerId == "LAW002" &&
                q.StartDate == startDate &&
                q.EndDate == endDate),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetLawyerEvents_ShouldReturnBadRequest_WhenMediatorThrows()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetLawyerEventsQuery>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("event query failed"));

        var result = await _controller.GetLawyerEvents("LAW002");

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CreateLawyerEvent_ShouldReturnOk_WhenSuccessful()
    {
        var request = new CreateLawyerEventDto
        {
            LawyerId = "LAW002",
            Title = "Office Meeting",
            EventType = "Meeting",
            DateTime = new DateTime(2026, 3, 21, 11, 0, 0),
            Duration = 60,
            Mode = "Physical"
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<CreateLawyerEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(44);

        var result = await _controller.CreateLawyerEvent(request);

        Assert.IsType<OkObjectResult>(result);
        _mediatorMock.Verify(m => m.Send(
            It.Is<CreateLawyerEventCommand>(c => c.Data == request),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateLawyerEvent_ShouldReturnBadRequest_WhenInvalidOperationThrown()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<CreateLawyerEventCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("This event overlaps with an existing appointment."));

        var result = await _controller.CreateLawyerEvent(new CreateLawyerEventDto());

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task UpdateLawyerEvent_ShouldReturnOk_WhenSuccessful()
    {
        var request = new UpdateLawyerEventDto
        {
            Title = "Updated Event",
            Duration = 45
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<UpdateLawyerEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _controller.UpdateLawyerEvent(9, request);

        Assert.IsType<OkObjectResult>(result);
        _mediatorMock.Verify(m => m.Send(
            It.Is<UpdateLawyerEventCommand>(c => c.EventId == 9 && c.Data == request),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateLawyerEvent_ShouldReturnNotFound_WhenEventMissing()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<UpdateLawyerEventCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new KeyNotFoundException("Lawyer event with ID 9 not found"));

        var result = await _controller.UpdateLawyerEvent(9, new UpdateLawyerEventDto());

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task DeleteLawyerEvent_ShouldReturnOk_WhenSuccessful()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<DeleteLawyerEventCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _controller.DeleteLawyerEvent(13);

        Assert.IsType<OkObjectResult>(result);
        _mediatorMock.Verify(m => m.Send(
            It.Is<DeleteLawyerEventCommand>(c => c.EventId == 13),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteLawyerEvent_ShouldReturnNotFound_WhenEventMissing()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<DeleteLawyerEventCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new KeyNotFoundException("Lawyer event with ID 13 not found"));

        var result = await _controller.DeleteLawyerEvent(13);

        Assert.IsType<NotFoundObjectResult>(result);
    }
}

