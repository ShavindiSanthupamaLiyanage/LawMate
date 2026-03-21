using LawMate.Application.Common.Interfaces;
using LawMate.Application.LawyerModule.LawyerAvailability.Commands;
using LawMate.Domain.Entities.Booking;
using LawMate.Tests.Common;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Domain.DTOs;
using LawMate.Infrastructure;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerAvailability.Commands
{
    public class UpdateAvailabilitySlotCommandHandlerTests
    {
        private readonly Mock<IAppLogger> _mockLogger = new();
        private readonly Mock<ICurrentUserService> _mockCurrentUser = new();

        private ApplicationDbContext GetContext(string dbName) =>
            TestDbContextFactory.Create(dbName);

        [Fact]
        public async Task Handle_Should_Update_Slot_Successfully()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Update_Slot_Successfully));

            context.TIMESLOT.Add(new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "L1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = true
            });
            await context.SaveChangesAsync();

            _mockCurrentUser.Setup(u => u.UserId).Returns("SYSTEM");

            var handler = new UpdateAvailabilitySlotCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);

            var command = new UpdateAvailabilitySlotCommand
            {
                TimeSlotId = 1,
                Data = new UpdateAvailabilitySlotDto
                {
                    Duration = 120, // extend to 2 hours
                    StartTime = "10:00" // new start time
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(MediatR.Unit.Value, result);

            var slot = await context.TIMESLOT.FindAsync(1);
            Assert.Equal(DateTime.Today.AddHours(10), slot.StartTime);
            Assert.Equal(DateTime.Today.AddHours(12), slot.EndTime);
            Assert.Equal("SYSTEM", slot.ModifiedBy);
            Assert.NotNull(slot.ModifiedAt);
        }

        [Fact]
        public async Task Handle_Should_Throw_KeyNotFound_When_Slot_Not_Found()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_KeyNotFound_When_Slot_Not_Found));
            var handler = new UpdateAvailabilitySlotCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);
            var command = new UpdateAvailabilitySlotCommand
            {
                TimeSlotId = 999,
                Data = new UpdateAvailabilitySlotDto { Duration = 60 }
            };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_InvalidOperation_When_Booked_Slot_DateTime_Changed()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_InvalidOperation_When_Booked_Slot_DateTime_Changed));

            context.TIMESLOT.Add(new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "L1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                BookingId = 123, // booked slot
                IsAvailable = false
            });
            await context.SaveChangesAsync();

            var handler = new UpdateAvailabilitySlotCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);

            var command = new UpdateAvailabilitySlotCommand
            {
                TimeSlotId = 1,
                Data = new UpdateAvailabilitySlotDto
                {
                    StartTime = "10:00"
                }
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_ArgumentException_For_Invalid_Time_Format()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_ArgumentException_For_Invalid_Time_Format));

            context.TIMESLOT.Add(new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "L1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = true
            });
            await context.SaveChangesAsync();

            var handler = new UpdateAvailabilitySlotCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);

            var command = new UpdateAvailabilitySlotCommand
            {
                TimeSlotId = 1,
                Data = new UpdateAvailabilitySlotDto
                {
                    StartTime = "invalid-time"
                }
            };

            await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_InvalidOperation_When_Overlapping_Slot()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_InvalidOperation_When_Overlapping_Slot));

            context.TIMESLOT.AddRange(
                new TIMESLOT
                {
                    TimeSlotId = 1,
                    LawyerId = "L1",
                    StartTime = DateTime.Today.AddHours(9),
                    EndTime = DateTime.Today.AddHours(10),
                    IsAvailable = true
                },
                new TIMESLOT
                {
                    TimeSlotId = 2,
                    LawyerId = "L1",
                    StartTime = DateTime.Today.AddHours(10),
                    EndTime = DateTime.Today.AddHours(11),
                    IsAvailable = true
                }
            );
            await context.SaveChangesAsync();

            var handler = new UpdateAvailabilitySlotCommandHandler(context, _mockCurrentUser.Object, _mockLogger.Object);

            var command = new UpdateAvailabilitySlotCommand
            {
                TimeSlotId = 1,
                Data = new UpdateAvailabilitySlotDto
                {
                    StartTime = "10:30", // overlaps with slot 2
                    Duration = 60
                }
            };

            await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(command, CancellationToken.None));
        }
    }
}