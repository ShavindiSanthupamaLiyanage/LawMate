using LawMate.Application.LawyerModule.LawyerBooking.Commands;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using System;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Tests.Common;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerBooking.Commands
{
    public class CreateClientBookingCommandHandlerTests
    {
        private ApplicationDbContext GetContext(string dbName) =>
            TestDbContextFactory.Create(dbName);

        [Fact]
        public async Task Handle_Should_Create_Booking_Successfully()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Create_Booking_Successfully));

            context.TIMESLOT.Add(new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "L1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = true
            });
            await context.SaveChangesAsync();

            var handler = new CreateClientBookingCommandHandler(context);

            var command = new CreateClientBookingCommand
            {
                ClientId = "C1",
                Data = new ClientCreateBookingDto
                {
                    LawyerId = "L1",
                    TimeSlotId = 1,
                    IssueDescription = "Test issue",
                    Mode = AppointmentMode.Physical,
                    Location = "Colombo"
                }
            };

            // Act
            var bookingId = await handler.Handle(command, CancellationToken.None);

            // Assert
            var booking = await context.BOOKING.FindAsync(bookingId);
            var slot = await context.TIMESLOT.FindAsync(1);

            Assert.NotNull(booking);
            Assert.Equal("C1", booking.ClientId);
            Assert.Equal(BookingStatus.Pending, booking.BookingStatus);
            Assert.Equal("L1", booking.LawyerId);
            Assert.Equal(60, booking.Duration); // 9 to 10 AM
            Assert.Equal("Test issue", booking.IssueDescription);

            Assert.False(slot.IsAvailable);
            Assert.Equal("C1", slot.BookedBy);
        }

        [Fact]
        public async Task Handle_Should_Throw_KeyNotFound_When_Slot_Not_Found()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_KeyNotFound_When_Slot_Not_Found));
            var handler = new CreateClientBookingCommandHandler(context);

            var command = new CreateClientBookingCommand
            {
                ClientId = "C1",
                Data = new ClientCreateBookingDto
                {
                    LawyerId = "L1",
                    TimeSlotId = 999
                }
            };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_InvalidOperation_When_Slot_Not_Available()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_InvalidOperation_When_Slot_Not_Available));

            context.TIMESLOT.Add(new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "L1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = false
            });
            await context.SaveChangesAsync();

            var handler = new CreateClientBookingCommandHandler(context);

            var command = new CreateClientBookingCommand
            {
                ClientId = "C1",
                Data = new ClientCreateBookingDto
                {
                    LawyerId = "L1",
                    TimeSlotId = 1
                }
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                handler.Handle(command, CancellationToken.None));
        }
    }
}