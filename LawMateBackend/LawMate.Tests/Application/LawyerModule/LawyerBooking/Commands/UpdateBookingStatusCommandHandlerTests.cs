using LawMate.Application.Common.Interfaces;
using LawMate.Application.LawyerModule.LawyerBooking.Commands;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
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
    public class UpdateBookingStatusCommandHandlerTests
    {
        private readonly Mock<ICurrentUserService> _mockCurrentUser = new();
        private readonly Mock<IAppLogger> _mockLogger = new();

        private ApplicationDbContext GetContext(string dbName) =>
            TestDbContextFactory.Create(dbName);

        [Fact]
        public async Task Handle_Should_Update_Booking_Status_Successfully()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Update_Booking_Status_Successfully));

            var booking = new BOOKING
            {
                BookingId = 1,
                BookingStatus = BookingStatus.Pending,
                ClientId = "CL1",
                LawyerId = "LAW1"
            };

            context.BOOKING.Add(booking);
            await context.SaveChangesAsync();

            _mockCurrentUser.Setup(c => c.UserId).Returns("ADMIN");

            var handler = new UpdateBookingStatusCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);

            var command = new UpdateBookingStatusCommand
            {
                BookingId = 1,
                Data = new UpdateBookingStatusDto
                {
                    Status = BookingStatus.Accepted
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(MediatR.Unit.Value, result);

            var updated = await context.BOOKING.FindAsync(1);
            Assert.Equal(BookingStatus.Accepted, updated.BookingStatus);
            Assert.Equal("ADMIN", updated.ModifiedBy);
            Assert.NotNull(updated.ModifiedAt);
        }

        [Fact]
        public async Task Handle_Should_Throw_KeyNotFound_When_Booking_Not_Found()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_KeyNotFound_When_Booking_Not_Found));

            var handler = new UpdateBookingStatusCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);

            var command = new UpdateBookingStatusCommand
            {
                BookingId = 999,
                Data = new UpdateBookingStatusDto
                {
                    Status = BookingStatus.Accepted
                }
            };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_ArgumentNullException_When_Data_Is_Null()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_ArgumentNullException_When_Data_Is_Null));
            var handler = new UpdateBookingStatusCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);

            var command = new UpdateBookingStatusCommand
            {
                BookingId = 1,
                Data = null,
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => handler.Handle(command, CancellationToken.None));
        }
    }
}