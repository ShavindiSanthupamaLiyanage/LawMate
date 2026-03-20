using LawMate.Application.LawyerModule.LawyerFinance.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.LawyerModule.LawyerFinance.Queries;

public class GetLawyerFinanceTransactionsQueryHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly GetLawyerFinanceTransactionsQueryHandler _handler;
    
    public GetLawyerFinanceTransactionsQueryHandlerTests()
    {
        // unique db name per test
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _handler = new GetLawyerFinanceTransactionsQueryHandler(_context);
    }

    private async Task SeedData()
    {
        var now = DateTime.UtcNow;

        _context.USER_DETAIL.AddRange(
            new USER_DETAIL { UserId = "client1", FirstName = "Alice", LastName = "Smith" },
            new USER_DETAIL { UserId = "client2", FirstName = "Bob", LastName = "Jones" }
        );

        _context.BOOKING.AddRange(
            new BOOKING { BookingId = 1, LawyerId = "lawyer1", ClientId = "client1" },
            new BOOKING { BookingId = 2, LawyerId = "lawyer1", ClientId = "client2" },
            new BOOKING { BookingId = 3, LawyerId = "lawyer1", ClientId = "clientX" } 
        );

        _context.BOOKING_PAYMENT.AddRange(
            new BOOKING_PAYMENT { Id = 1, BookingId = 1, LawyerId = "lawyer1", VerificationStatus = VerificationStatus.Verified, LawyerFee = 100, VerifiedAt = now.AddDays(-2) },
            new BOOKING_PAYMENT { Id = 2, BookingId = 2, LawyerId = "lawyer1", VerificationStatus = VerificationStatus.Pending, LawyerFee = 200 },
            new BOOKING_PAYMENT { Id = 3, BookingId = 3, LawyerId = "lawyer1", VerificationStatus = VerificationStatus.Rejected, LawyerFee = 50 }
        );

        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task Handle_ShouldReturnAllTransactions_WhenNoFilter()
    {
        await SeedData();

        var query = new GetLawyerFinanceTransactionsQuery("lawyer1");
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(3, result.Count);

        var verified = result.First(x => x.PaymentId == 1);
        Assert.Equal("Verified Payment", verified.Status);
        Assert.Equal("Alice Smith", verified.ClientDisplay);

        var pending = result.First(x => x.PaymentId == 2);
        Assert.Equal("Pending Verification", pending.Status);
        Assert.Equal("Bob Jones", pending.ClientDisplay);

        var rejected = result.First(x => x.PaymentId == 3);
        Assert.Equal("Rejected Payment", rejected.Status);
        Assert.Equal("clientX", rejected.ClientDisplay); // unknown client
    }

    [Fact]
    public async Task Handle_ShouldFilterByStatus()
    {
        await SeedData();

        var query = new GetLawyerFinanceTransactionsQuery("lawyer1", Status: VerificationStatus.Verified);
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(1, result[0].PaymentId);
        Assert.Equal("Verified Payment", result[0].Status);
    }

    [Fact]
    public async Task Handle_ShouldFilterBySearch()
    {
        await SeedData();

        var query = new GetLawyerFinanceTransactionsQuery("lawyer1", Search: "bob");
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Single(result);
        Assert.Equal(2, result[0].PaymentId);
        Assert.Equal("Bob Jones", result[0].ClientDisplay);
    }

    [Fact]
    public async Task Handle_ShouldReturnEmptyList_WhenNoPayments()
    {
        var query = new GetLawyerFinanceTransactionsQuery("lawyerX");
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Empty(result);
    }
}