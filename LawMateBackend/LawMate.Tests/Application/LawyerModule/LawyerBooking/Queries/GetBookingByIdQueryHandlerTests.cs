using LawMate.Application.Common.Interfaces;
using LawMate.Application.LawyerModule.LawyerBooking.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerBooking.Queries
{
    public class GetBookingByIdQueryHandlerTests
    {
        private ApplicationDbContext GetContext(string dbName) =>
            TestDbContextFactory.Create(dbName);

        [Fact]
        public async Task Handle_Should_Return_Booking_Successfully()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Return_Booking_Successfully));

            var client = new USER_DETAIL
            {
                UserId = "CL1",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                ContactNumber = "1234567890",
                UserRole = UserRole.Client
            };

            var lawyer = new USER_DETAIL
            {
                UserId = "LAW1",
                FirstName = "Jane",
                LastName = "Smith",
                UserRole = UserRole.Lawyer
            };

            var slot = new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "LAW1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = false
            };

            var booking = new BOOKING
            {
                BookingId = 1,
                ClientId = "CL1",
                LawyerId = "LAW1",
                TimeSlotId = 1,
                ScheduledDateTime = slot.StartTime,
                BookingStatus = BookingStatus.Pending,
                PaymentStatus = PaymentStatus.Pending,
                Mode = AppointmentMode.Physical,
                IssueDescription = "Test case",
                CaseType = LegalCategory.FamilyLaw
            };

            context.USER_DETAIL.AddRange(client, lawyer);
            context.TIMESLOT.Add(slot);
            context.BOOKING.Add(booking);
            await context.SaveChangesAsync();

            var handler = new GetBookingByIdQueryHandler(context);

            var query = new GetBookingByIdQuery(1);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.BookingId);
            Assert.Equal("John Doe", result.ClientName);
            Assert.Equal("Jane Smith", result.LawyerName);
            Assert.Equal("Physical", result.Mode);
            Assert.Equal("Family Law", result.CaseType);
            Assert.Equal("Test case", result.Notes);
            Assert.Equal("Pending", result.Status);
        }

        [Fact]
        public async Task Handle_Should_Throw_KeyNotFound_When_Booking_Not_Found()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_KeyNotFound_When_Booking_Not_Found));

            var handler = new GetBookingByIdQueryHandler(context);
            var query = new GetBookingByIdQuery(999);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                handler.Handle(query, CancellationToken.None));
        }
    }
}