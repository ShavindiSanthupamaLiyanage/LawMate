using LawMate.Application.Common.Interfaces;
using LawMate.Application.LawyerModule.LawyerBooking.Commands;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerBooking.Commands
{
    public class CreateManualBookingCommandHandlerTests
    {
        private Mock<ICurrentUserService> _mockCurrentUser = new();
        private Mock<IAppLogger> _mockLogger = new();

        private ApplicationDbContext GetContext(string dbName) =>
            TestDbContextFactory.Create(dbName);

        [Fact]
        public async Task Handle_Should_Create_Manual_Booking_Successfully()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Create_Manual_Booking_Successfully));

            context.USER_DETAIL.AddRange(
                new USER_DETAIL { UserId = "LAW1", UserRole = UserRole.Lawyer },
                new USER_DETAIL { UserId = "CL1", UserRole = UserRole.Client, Email = "client@test.com" }
            );

            await context.SaveChangesAsync();

            _mockCurrentUser.Setup(c => c.UserId).Returns("ADMIN");

            var handler = new CreateManualBookingCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);

            var command = new CreateManualBookingCommand
            {
                Data = new CreateManualBookingDto
                {
                    LawyerId = "LAW1",
                    ClientEmail = "client@test.com",
                    DateTime = DateTime.Today.AddHours(9),
                    Duration = 60,
                    Location = "Colombo",
                    Notes = "Urgent",
                    Price = 1000
                }
            };

            // Act
            var bookingId = await handler.Handle(command, CancellationToken.None);

            // Assert
            var booking = await context.BOOKING.FindAsync(bookingId);
            var timeslot = await context.TIMESLOT.FirstOrDefaultAsync();

            Assert.NotNull(booking);
            Assert.Equal("CL1", booking.ClientId);
            Assert.Equal("LAW1", booking.LawyerId);
            Assert.Equal(BookingStatus.Accepted, booking.BookingStatus);
            Assert.Equal(60, booking.Duration);
            Assert.Equal(1000, booking.Amount);

            Assert.NotNull(timeslot);
            Assert.Equal(timeslot.TimeSlotId, booking.TimeSlotId);
            Assert.False(timeslot.IsAvailable);
            Assert.Equal("CL1", timeslot.BookedBy);
        }

        [Fact]
        public async Task Handle_Should_Throw_KeyNotFound_When_Lawyer_Not_Found()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_KeyNotFound_When_Lawyer_Not_Found));

            context.USER_DETAIL.Add(new USER_DETAIL { UserId = "CL1", UserRole = UserRole.Client, Email = "client@test.com" });
            await context.SaveChangesAsync();

            var handler = new CreateManualBookingCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);

            var command = new CreateManualBookingCommand
            {
                Data = new CreateManualBookingDto
                {
                    LawyerId = "INVALID",
                    ClientEmail = "client@test.com",
                    DateTime = DateTime.Now,
                    Duration = 60
                }
            };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_KeyNotFound_When_Client_Not_Found()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_KeyNotFound_When_Client_Not_Found));

            context.USER_DETAIL.Add(new USER_DETAIL { UserId = "LAW1", UserRole = UserRole.Lawyer });
            await context.SaveChangesAsync();

            var handler = new CreateManualBookingCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);

            var command = new CreateManualBookingCommand
            {
                Data = new CreateManualBookingDto
                {
                    LawyerId = "LAW1",
                    ClientEmail = "unknown@test.com",
                    DateTime = DateTime.Now,
                    Duration = 60
                }
            };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_InvalidOperation_When_Timeslot_Already_Booked()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_InvalidOperation_When_Timeslot_Already_Booked));

            context.USER_DETAIL.AddRange(
                new USER_DETAIL { UserId = "LAW1", UserRole = UserRole.Lawyer },
                new USER_DETAIL { UserId = "CL1", UserRole = UserRole.Client, Email = "client@test.com" }
            );

            context.TIMESLOT.Add(new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "LAW1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = false
            });

            await context.SaveChangesAsync();

            var handler = new CreateManualBookingCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);

            var command = new CreateManualBookingCommand
            {
                Data = new CreateManualBookingDto
                {
                    LawyerId = "LAW1",
                    ClientEmail = "client@test.com",
                    TimeSlotId = 1,
                    DateTime = DateTime.Today.AddHours(9),
                    Duration = 60
                }
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(command, CancellationToken.None));
        }
    }
}