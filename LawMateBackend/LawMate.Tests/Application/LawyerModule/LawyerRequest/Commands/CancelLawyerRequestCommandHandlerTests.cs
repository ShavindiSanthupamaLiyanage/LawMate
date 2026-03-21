using LawMate.Application.LawyerModule.LawyerRequest.Commands;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Tests.Common;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerRequest.Commands
{
    public class CancelLawyerRequestCommandHandlerTests
    {
        [Fact]
        public async Task Handle_Should_Cancel_When_Status_Is_Confirmed()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Cancel_When_Status_Is_Confirmed));

            context.BOOKING.Add(new BOOKING
            {
                BookingId = 1,
                LawyerId = "L1",
                ClientId = "C1",
                BookingStatus = BookingStatus.Confirmed
            });

            await context.SaveChangesAsync();

            var handler = new CancelLawyerRequestCommandHandler(context);

            var command = new CancelLawyerRequestCommand(1, "L1", "Client requested cancellation");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);

            var booking = context.BOOKING.First();
            Assert.Equal(BookingStatus.Cancelled, booking.BookingStatus);
            Assert.Equal("Client requested cancellation", booking.RejectionReason);
            Assert.Equal("L1", booking.ModifiedBy);
            Assert.NotNull(booking.ModifiedAt);
        }

        [Fact]
        public async Task Handle_Should_Cancel_When_Status_Is_Accepted()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Cancel_When_Status_Is_Accepted));

            context.BOOKING.Add(new BOOKING
            {
                BookingId = 1,
                LawyerId = "L1",
                ClientId = "C1",
                BookingStatus = BookingStatus.Accepted
            });

            await context.SaveChangesAsync();

            var handler = new CancelLawyerRequestCommandHandler(context);

            var command = new CancelLawyerRequestCommand(1, "L1", "Not available");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);

            var booking = context.BOOKING.First();
            Assert.Equal(BookingStatus.Cancelled, booking.BookingStatus);
            Assert.Equal("Not available", booking.RejectionReason);
        }

        [Fact]
        public async Task Handle_Should_Return_False_When_Status_Is_Not_Allowed()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Return_False_When_Status_Is_Not_Allowed));

            context.BOOKING.Add(new BOOKING
            {
                BookingId = 1,
                LawyerId = "L1",
                ClientId = "C1",
                BookingStatus = BookingStatus.Pending // not allowed
            });

            await context.SaveChangesAsync();

            var handler = new CancelLawyerRequestCommandHandler(context);

            var command = new CancelLawyerRequestCommand(1, "L1", "Invalid state");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task Handle_Should_Return_False_When_LawyerId_Does_Not_Match()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Return_False_When_LawyerId_Does_Not_Match));

            context.BOOKING.Add(new BOOKING
            {
                BookingId = 1,
                LawyerId = "L1",
                ClientId = "C3",
                BookingStatus = BookingStatus.Accepted
            });

            await context.SaveChangesAsync();

            var handler = new CancelLawyerRequestCommandHandler(context);

            var command = new CancelLawyerRequestCommand(1, "L2", "Wrong lawyer");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task Handle_Should_Return_False_When_Booking_Not_Found()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Return_False_When_Booking_Not_Found));

            var handler = new CancelLawyerRequestCommandHandler(context);

            var command = new CancelLawyerRequestCommand(999, "L1", "No booking");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }
    }
}