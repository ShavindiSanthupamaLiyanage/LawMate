using LawMate.Application.AdminModule.AdminReports.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Infrastructure;
using LawMate.Tests.Common;

namespace LawMate.Tests.Application.AdminModule.AdminReports.Queries;

public class GetFinancialSummaryReportQueryHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly GetFinancialSummaryReportQueryHandler _handler;

    public GetFinancialSummaryReportQueryHandlerTests()
    {
        _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        _handler = new GetFinancialSummaryReportQueryHandler(_context);
    }

    private async Task SeedData()
    {
        var now = DateTime.Today;

        // BOOKINGS
        _context.BOOKING.AddRange(
            new BOOKING 
            { 
                BookingId = 1, 
                ClientId = "client1",          
                LawyerId = "lawyer1",         
                PaymentStatus = PaymentStatus.Paid, 
                Amount = 100, 
                ScheduledDateTime = now 
            },
            new BOOKING 
            { 
                BookingId = 2, 
                ClientId = "client1",
                LawyerId = "lawyer1",
                PaymentStatus = PaymentStatus.Pending, 
                Amount = 200, 
                ScheduledDateTime = now 
            },
            new BOOKING 
            { 
                BookingId = 3, 
                ClientId = "client1",
                LawyerId = "lawyer1",
                PaymentStatus = PaymentStatus.Paid, 
                Amount = 300, 
                ScheduledDateTime = now.AddMonths(-1) 
            }
        );

        // MEMBERSHIP PAYMENTS
        _context.MEMBERSHIP_PAYMENT.AddRange(
            new MEMBERSHIP_PAYMENT
            {
                Id = 1,
                LawyerId = "lawyer1", 
                VerificationStatus = VerificationStatus.Verified,
                Amount = 500,
                IsExpired = false,
                PaymentDate = now
            },
            new MEMBERSHIP_PAYMENT
            {
                Id = 2,
                LawyerId = "lawyer1", 
                VerificationStatus = VerificationStatus.Verified,
                Amount = 400,
                IsExpired = true,
                PaymentDate = now
            },
            new MEMBERSHIP_PAYMENT
            {
                Id = 3,
                LawyerId = "lawyer1", 
                VerificationStatus = VerificationStatus.Pending,
                Amount = 300,
                IsExpired = false
            }
        );

        // USERS
        _context.USER_DETAIL.AddRange(
            new USER_DETAIL { UserId = "client1", UserRole = UserRole.Client },
            new USER_DETAIL { UserId = "lawyer1", UserRole = UserRole.Lawyer }
        );

        // LAWYER DETAILS
        _context.LAWYER_DETAILS.AddRange(
            new LAWYER_DETAILS { UserId = "lawyer1", VerificationStatus = VerificationStatus.Verified },
            new LAWYER_DETAILS { UserId = "lawyer2", VerificationStatus = VerificationStatus.Pending }
        );

        _context.CONSULTATION.AddRange(
            new CONSULTATION 
            { 
                Id = 1,
                IsCompleted = true,
                ConsultationStatus = ConsultationStatus.Completed
            },
            new CONSULTATION 
            { 
                Id = 2,
                IsCompleted = false,
                ConsultationStatus = ConsultationStatus.InProgress
            }
        );

        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task Handle_ShouldReturnCorrectFinancialSummary()
    {
        await SeedData();

        var result = await _handler.Handle(new GetFinancialSummaryReportQuery(), CancellationToken.None);
        var report = result.First();

        // BOOKINGS
        Assert.Equal(3, report.TotalBookings);
        Assert.Equal(100 + 300, report.TotalBookingRevenue); 
        Assert.Equal(200, report.PendingBookingRevenue);

        // MEMBERSHIPS
        Assert.Equal(2, report.TotalMemberships);
        Assert.Equal(500 + 400, report.TotalMembershipRevenue);
        Assert.Equal(1, report.ActiveMemberships); 

        // USERS
        Assert.Equal(1, report.TotalClients);
        Assert.Equal(1, report.TotalLawyers);

        // LAWYERS
        Assert.Equal(1, report.VerifiedLawyers);

        // CONSULTATIONS
        Assert.Equal(1, report.CompletedConsultations);
        Assert.Equal(1, report.OngoingConsultations);

        // THIS MONTH
        Assert.Equal(100, report.ThisMonthBookingRevenue); 
        Assert.Equal(500 + 400, report.ThisMonthMembershipRevenue);
    }

    [Fact]
    public async Task Handle_ShouldReturnZeros_WhenNoData()
    {
        var result = await _handler.Handle(new GetFinancialSummaryReportQuery(), CancellationToken.None);
        var report = result.First();

        Assert.Equal(0, report.TotalBookings);
        Assert.Equal(0, report.TotalBookingRevenue);
        Assert.Equal(0, report.PendingBookingRevenue);
        Assert.Equal(0, report.TotalMemberships);
        Assert.Equal(0, report.TotalMembershipRevenue);
        Assert.Equal(0, report.ActiveMemberships);
        Assert.Equal(0, report.TotalClients);
        Assert.Equal(0, report.TotalLawyers);
        Assert.Equal(0, report.VerifiedLawyers);
        Assert.Equal(0, report.CompletedConsultations);
        Assert.Equal(0, report.OngoingConsultations);
        Assert.Equal(0, report.ThisMonthBookingRevenue);
        Assert.Equal(0, report.ThisMonthMembershipRevenue);
    }
}