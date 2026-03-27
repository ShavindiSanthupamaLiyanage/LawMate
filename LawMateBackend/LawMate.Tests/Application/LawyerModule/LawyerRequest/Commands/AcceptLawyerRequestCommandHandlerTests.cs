using LawMate.Application.LawyerModule.LawyerRequest.Commands;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Tests.Common;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerRequest.Commands
{
    public class AcceptLawyerRequestCommandHandlerTests
    {
        [Fact]
        public async Task Handle_Should_Return_True_And_Update_Booking_When_Valid()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Return_True_And_Update_Booking_When_Valid));

            context.BOOKING.Add(new BOOKING
            {
                BookingId = 1,
                LawyerId = "L1",
                ClientId = "C1",
                BookingStatus = BookingStatus.Pending
            });

            await context.SaveChangesAsync();

            var handler = new AcceptLawyerRequestCommandHandler(context);

            var command = new AcceptLawyerRequestCommand(1, "L1", "Teams Link");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);

            var booking = context.BOOKING.First();
            Assert.Equal(BookingStatus.Accepted, booking.BookingStatus);
            Assert.Equal("L1", booking.ModifiedBy);
            Assert.NotNull(booking.ModifiedAt);
        }

        [Fact]
        public async Task Handle_Should_Return_False_When_Booking_Not_Found()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Return_False_When_Booking_Not_Found));

            var handler = new AcceptLawyerRequestCommandHandler(context);

            var command = new AcceptLawyerRequestCommand(999, "L1", null);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task Handle_Should_Return_False_When_Status_Is_Not_Pending()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Return_False_When_Status_Is_Not_Pending));
        
            context.BOOKING.Add(new BOOKING
            {
                BookingId = 5,
                LawyerId = "L1",
                ClientId = "C1",
                BookingStatus = BookingStatus.Accepted 
            });
        
            await context.SaveChangesAsync();
        
            var handler = new AcceptLawyerRequestCommandHandler(context);
        
            var command = new AcceptLawyerRequestCommand(5, "L1", null);
        
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
                BookingId = 2,
                LawyerId = "L1",
                ClientId = "C2",
                BookingStatus = BookingStatus.Pending
            });
        
            await context.SaveChangesAsync();
        
            var handler = new AcceptLawyerRequestCommandHandler(context);
        
            var command = new AcceptLawyerRequestCommand(2, "L2", null);
        
            // Act
            var result = await handler.Handle(command, CancellationToken.None);
        
            // Assert
            Assert.False(result);
        }
    }
}