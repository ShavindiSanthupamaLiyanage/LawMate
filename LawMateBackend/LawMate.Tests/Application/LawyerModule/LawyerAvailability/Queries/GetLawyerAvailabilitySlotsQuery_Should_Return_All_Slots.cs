using LawMate.Application.Common.Interfaces;
using LawMate.Application.LawyerModule.LawyerAvailability.Queries;
using LawMate.Domain.Entities.Booking;
using LawMate.Tests.Common;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerAvailability.Queries
{
    public class AvailabilitySlotQueryHandlerTests
    {
        [Fact]
        public async Task GetLawyerAvailabilitySlotsQuery_Should_Return_All_Slots()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(GetLawyerAvailabilitySlotsQuery_Should_Return_All_Slots));

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
                    StartTime = DateTime.Today.AddHours(11),
                    EndTime = DateTime.Today.AddHours(12),
                    IsAvailable = true
                },
                new TIMESLOT
                {
                    TimeSlotId = 3,
                    LawyerId = "L2", // another lawyer
                    StartTime = DateTime.Today.AddHours(13),
                    EndTime = DateTime.Today.AddHours(14),
                    IsAvailable = true
                }
            );

            await context.SaveChangesAsync();

            var handler = new GetLawyerAvailabilitySlotsQueryHandler(context);

            var query = new GetLawyerAvailabilitySlotsQuery("L1");

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.All(result, r => Assert.Equal("L1", r.LawyerId));
        }

        [Fact]
        public async Task GetLawyerAvailabilitySlotsQuery_Should_Filter_By_Start_And_End_Date()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(GetLawyerAvailabilitySlotsQuery_Should_Filter_By_Start_And_End_Date));

            var today = DateTime.Today;

            context.TIMESLOT.AddRange(
                new TIMESLOT
                {
                    TimeSlotId = 1,
                    LawyerId = "L1",
                    StartTime = today.AddDays(1).AddHours(9),
                    EndTime = today.AddDays(1).AddHours(10),
                    IsAvailable = true
                },
                new TIMESLOT
                {
                    TimeSlotId = 2,
                    LawyerId = "L1",
                    StartTime = today.AddDays(2).AddHours(11),
                    EndTime = today.AddDays(2).AddHours(12),
                    IsAvailable = true
                }
            );

            await context.SaveChangesAsync();

            var handler = new GetLawyerAvailabilitySlotsQueryHandler(context);

            var query = new GetLawyerAvailabilitySlotsQuery(
                LawyerId: "L1",
                StartDate: today.AddDays(2),
                EndDate: today.AddDays(2)
            );

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal(2, result[0].TimeSlotId);
        }

        [Fact]
        public async Task GetAvailabilitySlotByIdQuery_Should_Return_Correct_Slot()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(GetAvailabilitySlotByIdQuery_Should_Return_Correct_Slot));

            context.TIMESLOT.Add(new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "L1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = true
            });

            await context.SaveChangesAsync();

            var handler = new GetAvailabilitySlotByIdQueryHandler(context);

            var query = new GetAvailabilitySlotByIdQuery(1);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.TimeSlotId);
            Assert.Equal("L1", result.LawyerId);
        }

        [Fact]
        public async Task GetAvailabilitySlotByIdQuery_Should_Throw_KeyNotFound_When_Slot_Not_Found()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(GetAvailabilitySlotByIdQuery_Should_Throw_KeyNotFound_When_Slot_Not_Found));
            var handler = new GetAvailabilitySlotByIdQueryHandler(context);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                handler.Handle(new GetAvailabilitySlotByIdQuery(999), CancellationToken.None));
        }

        [Fact]
        public async Task GetLawyerAvailabilitySlotsQuery_Should_Throw_ArgumentException_When_LawyerId_Empty()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(GetLawyerAvailabilitySlotsQuery_Should_Throw_ArgumentException_When_LawyerId_Empty));
            var handler = new GetLawyerAvailabilitySlotsQueryHandler(context);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() =>
                handler.Handle(new GetLawyerAvailabilitySlotsQuery(""), CancellationToken.None));
        }
    }
}