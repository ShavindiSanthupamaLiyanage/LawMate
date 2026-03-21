using LawMate.Application.Common.Interfaces;
using LawMate.Application.LawyerModule.LawyerBooking.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.LawyerModule.LawyerBooking.Queries;

public class GetLawyerAppointmentsQueryHandlerTests
{
    private IApplicationDbContext GetContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        var context = new ApplicationDbContext(options);
        return context;
    }

    [Fact]
    public async Task Handle_Should_Return_Appointments_For_Lawyer()
    {
        // Arrange
        var context = GetContext(nameof(Handle_Should_Return_Appointments_For_Lawyer));

        // Fixed date for deterministic testing
        var fixedDate = new DateTime(2023, 5, 21, 10, 0, 0);

        // Add client
        var client = new USER_DETAIL
        {
            UserId = "CL1",
            FirstName = "John",
            LastName = "Doe",
            Email = "john@example.com",
            ContactNumber = "123456789",
            UserRole = UserRole.Client
        };

        // Add lawyer
        var lawyer = new USER_DETAIL
        {
            UserId = "LAW1",
            FirstName = "Alice",
            LastName = "Smith",
            UserRole = UserRole.Lawyer
        };

        // Add timeslot
        var slot = new TIMESLOT
        {
            TimeSlotId = 1,
            LawyerId = "LAW1",
            StartTime = fixedDate,
            EndTime = fixedDate.AddHours(1),
            IsAvailable = false
        };

        // Add booking
        var booking = new BOOKING
        {
            BookingId = 1,
            ClientId = "CL1",
            LawyerId = "LAW1",
            TimeSlotId = 1,
            ScheduledDateTime = fixedDate,
            Duration = 60,
            IssueDescription = "Test case",
            BookingStatus = BookingStatus.Pending,
            PaymentStatus = PaymentStatus.Pending,
            CaseType = LegalCategory.FamilyLaw,
            Mode = AppointmentMode.Online,
            CreatedBy = "CL1",
            CreatedAt = DateTime.UtcNow
        };

        context.USER_DETAIL.AddRange(client, lawyer);
        context.TIMESLOT.Add(slot);
        context.BOOKING.Add(booking);
        await context.SaveChangesAsync(CancellationToken.None);

        var handler = new GetLawyerAppointmentsQueryHandler(context);
        var query = new GetLawyerAppointmentsQuery("LAW1");

        // Act
        var result = await handler.Handle(query, default);

        // Assert
        Assert.Single(result);
        var appointment = result.First();
        Assert.Equal(1, appointment.BookingId);
        Assert.Equal("John Doe", appointment.ClientName);
        Assert.Equal("Family Law", appointment.CaseType);
        Assert.Equal("Pending", appointment.Status);
        Assert.Equal("2023", appointment.StartTime.Substring(0, 4)); // ISO string check
    }
}