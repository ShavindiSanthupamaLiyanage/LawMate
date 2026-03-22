using LawMate.Application.Common.Interfaces;
using LawMate.Application.LawyerModule.LawyerAvailability.Commands;
using LawMate.Domain.Entities.Booking;
using LawMate.Tests.Common;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Infrastructure;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerAvailability.Commands
{
    public class DeleteAvailabilitySlotCommandHandlerTests
    {
        private readonly Mock<IAppLogger> _mockLogger = new();

        private ApplicationDbContext GetContext(string dbName) =>
            TestDbContextFactory.Create(dbName);

        [Fact]
        public async Task Handle_Should_Delete_Slot_Successfully()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Delete_Slot_Successfully));

            context.TIMESLOT.Add(new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "L1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = true
            });

            await context.SaveChangesAsync();

            var handler = new DeleteAvailabilitySlotCommandHandler(context, _mockLogger.Object);

            var command = new DeleteAvailabilitySlotCommand { TimeSlotId = 1 };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(MediatR.Unit.Value, result);
            Assert.Empty(context.TIMESLOT);
        }

        [Fact]
        public async Task Handle_Should_Throw_KeyNotFound_When_Slot_Not_Found()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_KeyNotFound_When_Slot_Not_Found));

            var handler = new DeleteAvailabilitySlotCommandHandler(context, _mockLogger.Object);
            var command = new DeleteAvailabilitySlotCommand { TimeSlotId = 999 };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_InvalidOperation_When_Slot_Is_Booked()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_InvalidOperation_When_Slot_Is_Booked));

            context.TIMESLOT.Add(new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "L1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = true,
                BookingId = 123 // slot is booked
            });

            await context.SaveChangesAsync();

            var handler = new DeleteAvailabilitySlotCommandHandler(context, _mockLogger.Object);
            var command = new DeleteAvailabilitySlotCommand { TimeSlotId = 1 };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                handler.Handle(command, CancellationToken.None));

            Assert.Equal("Cannot delete a booked time slot. Please cancel the booking first.", ex.Message);
        }
    }
}