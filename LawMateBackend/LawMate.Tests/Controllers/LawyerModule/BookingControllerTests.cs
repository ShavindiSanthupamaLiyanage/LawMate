using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using LawMate.API.Controllers.LawyerModule;
using LawMate.Application.LawyerModule.LawyerBooking.Commands;
using LawMate.Application.LawyerModule.LawyerBooking.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace LawMate.Tests.API.LawyerModule
{
    public class BookingControllerTests
    {
        private readonly Mock<IMediator> _mockMediator;
        private readonly BookingController _controller;

        public BookingControllerTests()
        {
            _mockMediator = new Mock<IMediator>();
            _controller = new BookingController(_mockMediator.Object);

            // Setup HttpContext with Claims for client identity
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "CLIENT1"),
            }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task GetLawyerAppointments_ReturnsOkResult_WithAppointments()
        {
            // Arrange
            var appointments = new List<GetAppointmentDto>
            {
                new() { BookingId = 1, ClientName = "John Doe" }
            };

            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetLawyerAppointmentsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(appointments);

            // Act
            var result = await _controller.GetLawyerAppointments("LAW1");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedAppointments = Assert.IsType<List<GetAppointmentDto>>(okResult.Value);
            Assert.Single(returnedAppointments);
            Assert.Equal("John Doe", returnedAppointments[0].ClientName);
        }

        [Fact]
        public async Task GetBookingById_ReturnsOkResult_WithBooking()
        {
            // Arrange
            var booking = new GetAppointmentDto { BookingId = 1, ClientName = "John Doe" };
            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetBookingByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(booking);

            // Act
            var result = await _controller.GetBookingById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedBooking = Assert.IsType<GetAppointmentDto>(okResult.Value);
            Assert.Equal(1, returnedBooking.BookingId);
        }

        [Fact]
        public async Task GetBookingById_ReturnsNotFound_WhenKeyNotFoundException()
        {
            _mockMediator
                .Setup(m => m.Send(It.IsAny<GetBookingByIdQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new KeyNotFoundException("Booking not found"));

            var result = await _controller.GetBookingById(99);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Booking not found", notFound.Value.ToString());
        }

        [Fact]
        public async Task CreateBooking_ReturnsOkResult_WhenSuccess()
        {
            // Arrange
            var bookingDto = new ClientCreateBookingDto
            {
                LawyerId = "LAW1",
                TimeSlotId = 1,
                CaseType = LegalCategory.FamilyLaw,
                Mode = AppointmentMode.Online,
                IssueDescription = "Test"
            };

            _mockMediator
                .Setup(m => m.Send(It.IsAny<CreateClientBookingCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(10);

            // Act
            var result = await _controller.CreateBooking(bookingDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("Booking created successfully", okResult.Value.ToString());
        }

        [Fact]
        public async Task CreateBooking_ReturnsUnauthorized_WhenClientIdMissing()
        {
            // Arrange: remove all claims
            _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal();

            var bookingDto = new ClientCreateBookingDto();

            // Act
            var result = await _controller.CreateBooking(bookingDto);

            // Assert
            var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Contains("Client identity not found", unauthorized.Value.ToString());
        }

        [Fact]
        public async Task CreateManualBooking_ReturnsOkResult_WhenSuccess()
        {
            var manualDto = new CreateManualBookingDto
            {
                LawyerId = "LAW1",
                ClientEmail = "client@example.com",
                DateTime = DateTime.UtcNow,
                Duration = 60,
            };

            _mockMediator
                .Setup(m => m.Send(It.IsAny<CreateManualBookingCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(5);

            var result = await _controller.CreateManualBooking(manualDto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("Appointment created successfully", okResult.Value.ToString());
        }

        [Fact]
        public async Task UpdateBookingStatus_ReturnsOkResult_WhenSuccess()
        {
            var statusDto = new UpdateBookingStatusDto
            {
                Status = BookingStatus.Accepted
            };

            _mockMediator
                .Setup(m => m.Send(It.IsAny<UpdateBookingStatusCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(Unit.Value);

            var result = await _controller.UpdateBookingStatus(1, statusDto);

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Contains("Booking status updated successfully", okResult.Value.ToString());
        }

        [Fact]
        public async Task UpdateBookingStatus_ReturnsNotFound_WhenKeyNotFoundException()
        {
            var statusDto = new UpdateBookingStatusDto
            {
                Status = BookingStatus.Accepted
            };

            _mockMediator
                .Setup(m => m.Send(It.IsAny<UpdateBookingStatusCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new KeyNotFoundException("Booking not found"));

            var result = await _controller.UpdateBookingStatus(99, statusDto);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Contains("Booking not found", notFound.Value.ToString());
        }
    }
}