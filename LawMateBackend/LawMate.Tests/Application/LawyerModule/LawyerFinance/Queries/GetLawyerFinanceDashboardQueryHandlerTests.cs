using LawMate.Application.LawyerModule.LawyerFinance.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using LawMate.Tests.Common;

namespace LawMate.Tests.Application.LawyerModule.LawyerFinance.Queries;

public class GetLawyerFinanceDashboardQueryHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly GetLawyerFinanceDashboardQueryHandler _handler;

    public GetLawyerFinanceDashboardQueryHandlerTests()
    {
        _context = TestDbContextFactory.Create("DashboardTestDb");
        _handler = new GetLawyerFinanceDashboardQueryHandler(_context);
    }

    private async Task SeedData()
    {
        var now = DateTime.UtcNow;

        // Users
        _context.USER_DETAIL.AddRange(
            new USER_DETAIL { UserId = "client1", FirstName = "Alice", LastName = "Smith" },
            new USER_DETAIL { UserId = "client2", FirstName = "", LastName = "" } 
        );

        // Bookings
        _context.BOOKING.AddRange(
            new BOOKING { BookingId = 1, LawyerId = "lawyer1", ClientId = "client1" },
            new BOOKING { BookingId = 2, LawyerId = "lawyer1", ClientId = "client2" },
            new BOOKING { BookingId = 3, LawyerId = "lawyer1", ClientId = "client3" } 
        );

        // Payments
        _context.BOOKING_PAYMENT.AddRange(
            new BOOKING_PAYMENT { Id = 1, BookingId = 1, LawyerId = "lawyer1", VerificationStatus = VerificationStatus.Verified, IsPaid = true, LawyerFee = 100, PaymentDate = now.AddDays(-10), VerifiedAt = now.AddDays(-5) },
            new BOOKING_PAYMENT { Id = 2, BookingId = 2, LawyerId = "lawyer1", VerificationStatus = VerificationStatus.Verified, IsPaid = false, LawyerFee = 200, PaymentDate = now.AddDays(-8), VerifiedAt = now.AddDays(-3) },
            new BOOKING_PAYMENT { Id = 3, BookingId = 3, LawyerId = "lawyer1", VerificationStatus = VerificationStatus.Pending, IsPaid = false, LawyerFee = 150, PaymentDate = now.AddDays(-6) },
            new BOOKING_PAYMENT { Id = 4, BookingId = 1, LawyerId = "lawyer1", VerificationStatus = VerificationStatus.Rejected, IsPaid = false, LawyerFee = 50, PaymentDate = now.AddDays(-2) }
        );

        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task Handle_ShouldReturnCorrectDashboard()
    {
        await SeedData();

        var query = new GetLawyerFinanceDashboardQuery("lawyer1");
        var result = await _handler.Handle(query, CancellationToken.None);

        // TotalEarnings: sum of Verified fees
        Assert.Equal(100 + 200, result.TotalEarnings);

        // ThisMonth: only verified payments in current month
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var expectedThisMonth = result.RecentTransactions
            .Where(t => t.TransactionDate >= monthStart && t.Status == "Verified Payment")
            .Sum(t => t.Amount);
        Assert.Equal(expectedThisMonth, result.ThisMonth);

        // PendingVerification: sum of Pending
        Assert.Equal(150, result.PendingVerification);

        // TransferredToBank: sum of Verified && IsPaid
        Assert.Equal(100, result.TransferredToBank);

        // RecentTransactions count
        Assert.Equal(4, result.RecentTransactions.Count);

        // ClientDisplay tests
        var tx1 = result.RecentTransactions.First(x => x.BookingId == 1 && x.PaymentId == 1);
        Assert.Equal("Alice Smith", tx1.ClientDisplay);

        var tx2 = result.RecentTransactions.First(x => x.BookingId == 2);
        Assert.Equal("client2", tx2.ClientDisplay); // fallback to ClientId for empty name

        var tx3 = result.RecentTransactions.First(x => x.BookingId == 3);
        Assert.Equal("client3", tx3.ClientDisplay); // Unknown client, fallback to Booking.ClientId
    }

    [Fact]
    public async Task Handle_ShouldReturnEmpty_WhenNoPayments()
    {
        var query = new GetLawyerFinanceDashboardQuery("lawyerX");
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(0, result.TotalEarnings);
        Assert.Equal(0, result.ThisMonth);
        Assert.Equal(0, result.PendingVerification);
        Assert.Equal(0, result.TransferredToBank);
        Assert.Empty(result.RecentTransactions);
    }
}