using LawMate.API.Controllers.LawyerModule;
using LawMate.Application.LawyerModule.LawyerBooking.Commands;
using LawMate.Application.LawyerModule.LawyerBooking.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.LawyerModule;

public class BookingControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly BookingController _controller;

    public BookingControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new BookingController(_mediatorMock.Object);
    }

    [Fact]
    public async Task GetLawyerAppointments_ShouldReturnOk_WithData()
    {
        var appointments = new List<GetAppointmentDto>
        {
            new()
            {
                BookingId = 5,
                AppointmentId = "APT-0005",
                ClientId = "CLI001",
                ClientName = "Client One",
                Email = "client1@example.com",
                CaseType = "Civil",
                DateTime = new DateTime(2026, 3, 20, 10, 0, 0),
                Duration = 30,
                Status = BookingStatus.Accepted,
                Mode = "Physical",
                Price = 7500,
                PaymentStatus = PaymentStatus.Pending,
                PaymentStatusDisplay = "Pending"
            }
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetLawyerAppointmentsQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(appointments);

        var startDate = new DateTime(2026, 3, 20);
        var endDate = new DateTime(2026, 3, 21);
        var result = await _controller.GetLawyerAppointments("LAW002", startDate, endDate);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Same(appointments, okResult.Value);

        _mediatorMock.Verify(m => m.Send(
            It.Is<GetLawyerAppointmentsQuery>(q =>
                q.LawyerId == "LAW002" &&
                q.StartDate == startDate &&
                q.EndDate == endDate),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetLawyerAppointments_ShouldReturnBadRequest_WhenMediatorThrows()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetLawyerAppointmentsQuery>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("appointments query failed"));

        var result = await _controller.GetLawyerAppointments("LAW002");

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task GetBookingById_ShouldReturnOk_WhenBookingExists()
    {
        var booking = new GetAppointmentDto
        {
            BookingId = 10,
            AppointmentId = "APT-0010",
            ClientId = "CLI001",
            ClientName = "Client One",
            Email = "client1@example.com",
            CaseType = "Family",
            DateTime = new DateTime(2026, 3, 22, 13, 30, 0),
            Duration = 60,
            Status = BookingStatus.Accepted,
            Mode = "Physical",
            Price = 10000,
            PaymentStatus = PaymentStatus.Paid,
            PaymentStatusDisplay = "Verified Payment"
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetBookingByIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(booking);

        var result = await _controller.GetBookingById(10);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Same(booking, okResult.Value);

        _mediatorMock.Verify(m => m.Send(
            It.Is<GetBookingByIdQuery>(q => q.BookingId == 10),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetBookingById_ShouldReturnNotFound_WhenBookingMissing()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetBookingByIdQuery>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new KeyNotFoundException("Booking with ID 10 not found"));

        var result = await _controller.GetBookingById(10);

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task CreateManualBooking_ShouldReturnOk_WhenSuccessful()
    {
        var request = new CreateManualBookingDto
        {
            LawyerId = "LAW002",
            ClientEmail = "client1@example.com",
            ClientName = "Client One",
            CaseType = "Civil",
            DateTime = new DateTime(2026, 3, 20, 10, 0, 0),
            Duration = 30,
            Price = 7500,
            Mode = "Physical"
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<CreateManualBookingCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(21);

        var result = await _controller.CreateManualBooking(request);

        Assert.IsType<OkObjectResult>(result);
        _mediatorMock.Verify(m => m.Send(
            It.Is<CreateManualBookingCommand>(c => c.Data == request),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateManualBooking_ShouldReturnNotFound_WhenLawyerMissing()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<CreateManualBookingCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new KeyNotFoundException("Lawyer with ID LAW002 not found"));

        var result = await _controller.CreateManualBooking(new CreateManualBookingDto());

        Assert.IsType<NotFoundObjectResult>(result);
    }

    [Fact]
    public async Task UpdateBookingStatus_ShouldReturnOk_WhenSuccessful()
    {
        var request = new UpdateBookingStatusDto
        {
            Status = BookingStatus.Confirmed
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<UpdateBookingStatusCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Unit.Value);

        var result = await _controller.UpdateBookingStatus(30, request);

        Assert.IsType<OkObjectResult>(result);
        _mediatorMock.Verify(m => m.Send(
            It.Is<UpdateBookingStatusCommand>(c => c.BookingId == 30 && c.Data == request),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateBookingStatus_ShouldReturnNotFound_WhenBookingMissing()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<UpdateBookingStatusCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new KeyNotFoundException("Booking with ID 30 not found"));

        var result = await _controller.UpdateBookingStatus(30, new UpdateBookingStatusDto());

        Assert.IsType<NotFoundObjectResult>(result);
    }
}

