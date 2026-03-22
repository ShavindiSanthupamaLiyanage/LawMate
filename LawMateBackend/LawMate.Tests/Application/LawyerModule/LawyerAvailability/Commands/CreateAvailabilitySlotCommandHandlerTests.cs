using LawMate.Application.Common.Interfaces;
using LawMate.Application.LawyerModule.LawyerAvailability.Commands;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
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
    public class CreateAvailabilitySlotCommandHandlerTests
    {
        private readonly Mock<ICurrentUserService> _mockCurrentUser = new();
        private readonly Mock<IAppLogger> _mockLogger = new();

        private ApplicationDbContext GetContext(string dbName) =>
            TestDbContextFactory.Create(dbName);

        [Fact]
        public async Task Handle_Should_Create_Slot_Successfully()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Create_Slot_Successfully));

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "L1",
                UserRole = UserRole.Lawyer
            });

            await context.SaveChangesAsync();

            _mockCurrentUser.Setup(x => x.UserId).Returns("SYSTEM");

            var handler = new CreateAvailabilitySlotCommandHandler(
                context,
                _mockCurrentUser.Object,
                _mockLogger.Object);

            var dto = new CreateAvailabilitySlotDto
            {
                LawyerId = "L1",
                Date = DateTime.Today,
                StartTime = "09:00",
                Duration = 60
            };

            var command = new CreateAvailabilitySlotCommand { Data = dto };

            // Act
            var timeSlotId = await handler.Handle(command, CancellationToken.None);

            // Assert
            var slot = await context.TIMESLOT.FindAsync(timeSlotId);
            Assert.NotNull(slot);
            Assert.Equal("L1", slot.LawyerId);
            Assert.True(slot.IsAvailable);
            Assert.Equal(DateTime.Today.AddHours(9), slot.StartTime);
            Assert.Equal(DateTime.Today.AddHours(10), slot.EndTime);
            Assert.Equal("SYSTEM", slot.CreatedBy);
        }

        [Fact]
        public async Task Handle_Should_Throw_When_LawyerId_NullOrEmpty()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_When_LawyerId_NullOrEmpty));
            var handler = new CreateAvailabilitySlotCommandHandler(
                context,
                _mockCurrentUser.Object,
                _mockLogger.Object);

            var dto = new CreateAvailabilitySlotDto
            {
                LawyerId = null,
                Date = DateTime.Today,
                StartTime = "09:00",
                Duration = 60
            };

            var command = new CreateAvailabilitySlotCommand { Data = dto };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() =>
                handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_When_Lawyer_NotFound()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_When_Lawyer_NotFound));
            var handler = new CreateAvailabilitySlotCommandHandler(
                context,
                _mockCurrentUser.Object,
                _mockLogger.Object);

            var dto = new CreateAvailabilitySlotDto
            {
                LawyerId = "L999",
                Date = DateTime.Today,
                StartTime = "09:00",
                Duration = 60
            };

            var command = new CreateAvailabilitySlotCommand { Data = dto };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_When_Invalid_StartTime()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_When_Invalid_StartTime));
            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "L1",
                UserRole = UserRole.Lawyer
            });
            await context.SaveChangesAsync();

            var handler = new CreateAvailabilitySlotCommandHandler(
                context,
                _mockCurrentUser.Object,
                _mockLogger.Object);

            var dto = new CreateAvailabilitySlotDto
            {
                LawyerId = "L1",
                Date = DateTime.Today,
                StartTime = "invalid",
                Duration = 60
            };

            var command = new CreateAvailabilitySlotCommand { Data = dto };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() =>
                handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_When_Slot_Overlaps()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_When_Slot_Overlaps));

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "L1",
                UserRole = UserRole.Lawyer
            });

            context.TIMESLOT.Add(new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "L1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = true
            });

            await context.SaveChangesAsync();

            var handler = new CreateAvailabilitySlotCommandHandler(
                context,
                _mockCurrentUser.Object,
                _mockLogger.Object);

            var dto = new CreateAvailabilitySlotDto
            {
                LawyerId = "L1",
                Date = DateTime.Today,
                StartTime = "09:30", // overlaps with 09:00-10:00
                Duration = 30
            };

            var command = new CreateAvailabilitySlotCommand { Data = dto };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                handler.Handle(command, CancellationToken.None));
        }
    }
}