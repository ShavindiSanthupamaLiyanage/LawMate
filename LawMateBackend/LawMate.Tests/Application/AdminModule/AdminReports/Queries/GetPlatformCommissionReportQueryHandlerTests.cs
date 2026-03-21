using LawMate.Application.AdminModule.AdminReports.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

public class GetPlatformCommissionReportQueryHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly GetPlatformCommissionReportQueryHandler _handler;

    public GetPlatformCommissionReportQueryHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _handler = new GetPlatformCommissionReportQueryHandler(_context);

        SeedData();
    }

    private void SeedData()
    {
        // Users
        var client = new USER_DETAIL
        {
            UserId = "client1",
            FirstName = "John",
            LastName = "Doe",
            Email = "john@test.com"
        };

        var lawyer = new USER_DETAIL
        {
            UserId = "lawyer1",
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane@test.com"
        };

        _context.USER_DETAIL.AddRange(client, lawyer);

        // Lawyer details
        _context.LAWYER_DETAILS.Add(new LAWYER_DETAILS
        {
            UserId = "lawyer1",
            AreaOfPractice = AreaOfPractice.Civil,
            WorkingDistrict = District.Colombo
        });

        // Booking
        _context.BOOKING.Add(new BOOKING
        {
            BookingId = 1,
            ClientId = "client1",
            LawyerId = "lawyer1",
            ScheduledDateTime = DateTime.UtcNow,
            Duration = 60,
            Amount = 1000m,
            BookingStatus = BookingStatus.Verified,
            PaymentStatus = PaymentStatus.Paid
        });

        // Payment
        _context.BOOKING_PAYMENT.Add(new BOOKING_PAYMENT
        {
            BookingId = 1,
            TransactionId = "TXN123",
            PaymentDate = DateTime.UtcNow,
            VerificationStatus = VerificationStatus.Verified
        });

        _context.SaveChanges();
    }

    [Fact]
    public async Task Handle_ShouldReturnPlatformCommissionReport()
    {
        // Arrange
        var query = new GetPlatformCommissionReportQuery();

        // Act
        var result = (await _handler.Handle(query, CancellationToken.None)).ToList();

        // Assert
        Assert.Single(result);

        var record = result.First();

        Assert.Equal(1, record.BookingId);
        Assert.Equal("John Doe", record.ClientName);
        Assert.Equal("Jane Smith", record.LawyerName);

        // Commission = 10% of 1000 = 100
        Assert.Equal(100m, record.PlatformCommission);

        // Payout = 900
        Assert.Equal(900m, record.LawyerPayout);

        Assert.Equal("TXN123", record.TransactionId);
        Assert.Equal(PaymentStatus.Paid.ToString(), record.PaymentStatus);
    }

    [Fact]
    public async Task Handle_ShouldIgnoreUnpaidBookings()
    {
        // Arrange
        _context.BOOKING.Add(new BOOKING
        {
            BookingId = 2,
            ClientId = "client1",
            LawyerId = "lawyer1",
            ScheduledDateTime = DateTime.UtcNow,
            Duration = 30,
            Amount = 500m,
            BookingStatus = BookingStatus.Accepted,
            PaymentStatus = PaymentStatus.Pending 
        });

        _context.SaveChanges();

        var query = new GetPlatformCommissionReportQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.Single(result); // Only the paid one
    }

    [Fact]
    public async Task Handle_ShouldHandleMissingPayment()
    {
        // Arrange
        _context.BOOKING.Add(new BOOKING
        {
            BookingId = 3,
            ClientId = "client1",
            LawyerId = "lawyer1",
            ScheduledDateTime = DateTime.UtcNow,
            Duration = 45,
            Amount = 800m,
            BookingStatus = BookingStatus.Verified,
            PaymentStatus = PaymentStatus.Paid
        });

        _context.SaveChanges();

        var query = new GetPlatformCommissionReportQuery();

        // Act
        var result = (await _handler.Handle(query, CancellationToken.None)).ToList();

        var record = result.FirstOrDefault(x => x.BookingId == 3);

        // Assert
        Assert.NotNull(record);
        Assert.Null(record.TransactionId);
        Assert.Null(record.PaymentDate);
        Assert.Null(record.PaymentVerificationStatus);
    }
}