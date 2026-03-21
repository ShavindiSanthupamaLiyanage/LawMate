using LawMate.Application.LawyerModule.LawyerRequest.Commands;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Tests.Common;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerRequest.Commands
{
    public class RejectLawyerRequestCommandHandlerTests
    {
        [Fact]
        public async Task Handle_Should_Reject_Booking_When_Valid()
        {
            // Arrange
            var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

            context.BOOKING.Add(new BOOKING
            {
                BookingId = 1,
                LawyerId = "L1",
                ClientId = "C1",
                BookingStatus = BookingStatus.Pending
            });

            await context.SaveChangesAsync();

            var handler = new RejectLawyerRequestCommandHandler(context);

            var command = new RejectLawyerRequestCommand(1, "L1", "Not interested");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);

            var booking = context.BOOKING.First();
            Assert.Equal(BookingStatus.Rejected, booking.BookingStatus);
            Assert.Equal("Not interested", booking.RejectionReason);
            Assert.Equal("L1", booking.ModifiedBy);
            Assert.NotNull(booking.ModifiedAt);
        }

        [Fact]
        public async Task Handle_Should_Return_False_When_Booking_Not_Found()
        {
            // Arrange
            var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

            var handler = new RejectLawyerRequestCommandHandler(context);

            var command = new RejectLawyerRequestCommand(999, "L1", "Invalid");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task Handle_Should_Return_False_When_Status_Is_Not_Pending()
        {
            // Arrange
            var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

            context.BOOKING.Add(new BOOKING
            {
                BookingId = 365,
                LawyerId = "L1",
                ClientId = "C1",
                BookingStatus = BookingStatus.Accepted // not allowed
            });

            await context.SaveChangesAsync();

            var handler = new RejectLawyerRequestCommandHandler(context);

            var command = new RejectLawyerRequestCommand(1, "L1", "Invalid state");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task Handle_Should_Return_False_When_LawyerId_Does_Not_Match()
        {
            // Arrange
            var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

            context.BOOKING.Add(new BOOKING
            {
                BookingId = 23,
                LawyerId = "L1",
                ClientId = "C1",
                BookingStatus = BookingStatus.Pending
            });

            await context.SaveChangesAsync();

            var handler = new RejectLawyerRequestCommandHandler(context);

            var command = new RejectLawyerRequestCommand(1, "L2", "Wrong lawyer");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }
    }
}