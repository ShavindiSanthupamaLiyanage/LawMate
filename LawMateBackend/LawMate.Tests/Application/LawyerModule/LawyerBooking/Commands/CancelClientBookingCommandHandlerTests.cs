using LawMate.Application.LawyerModule.LawyerBooking.Commands;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using System;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Tests.Common;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerBooking.Commands
{
    public class CancelClientBookingCommandHandlerTests
    {
        private ApplicationDbContext GetContext(string dbName) =>
            TestDbContextFactory.Create(dbName);

        [Fact]
        public async Task Handle_Should_Cancel_Booking_Successfully()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Cancel_Booking_Successfully));

            var booking = new BOOKING
            {
                BookingId = 1,
                ClientId = "C1",
                LawyerId = "L16",
                BookingStatus = BookingStatus.Pending
            };
            context.BOOKING.Add(booking);
            await context.SaveChangesAsync();

            var handler = new CancelClientBookingCommandHandler(context);
            var command = new CancelClientBookingCommand(1, "C1", "Client request");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            var updatedBooking = await context.BOOKING.FindAsync(1);
            Assert.Equal(BookingStatus.Cancelled, updatedBooking.BookingStatus);
            Assert.Equal("Client request", updatedBooking.RejectionReason);
            Assert.Equal("C1", updatedBooking.ModifiedBy);
            Assert.NotNull(updatedBooking.ModifiedAt);
        }

        [Fact]
        public async Task Handle_Should_Return_False_When_Booking_Not_Found()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Return_False_When_Booking_Not_Found));

            var handler = new CancelClientBookingCommandHandler(context);
            var command = new CancelClientBookingCommand(999, "C1", "Reason");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task Handle_Should_Return_False_When_Booking_Status_Not_Cancellable()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Return_False_When_Booking_Status_Not_Cancellable));

            var booking = new BOOKING
            {
                BookingId = 1,
                ClientId = "C1",
                LawyerId = "L11",
                BookingStatus = BookingStatus.Cancelled // already cancelled
            };
            context.BOOKING.Add(booking);
            await context.SaveChangesAsync();

            var handler = new CancelClientBookingCommandHandler(context);
            var command = new CancelClientBookingCommand(1, "C1", "Client request");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);

            var updatedBooking = await context.BOOKING.FindAsync(1);
            Assert.Equal(BookingStatus.Cancelled, updatedBooking.BookingStatus); // unchanged
            Assert.Null(updatedBooking.RejectionReason);
        }

        [Fact]
        public async Task Handle_Should_Return_False_When_ClientId_Does_Not_Match()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Return_False_When_ClientId_Does_Not_Match));

            var booking = new BOOKING
            {
                BookingId = 1,
                ClientId = "C1",
                LawyerId = "L6",
                BookingStatus = BookingStatus.Pending
            };
            context.BOOKING.Add(booking);
            await context.SaveChangesAsync();

            var handler = new CancelClientBookingCommandHandler(context);
            var command = new CancelClientBookingCommand(1, "C2", "Client request"); // wrong client

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
            var unchangedBooking = await context.BOOKING.FindAsync(1);
            Assert.Equal(BookingStatus.Pending, unchangedBooking.BookingStatus);
            Assert.Null(unchangedBooking.RejectionReason);
        }
    }
}