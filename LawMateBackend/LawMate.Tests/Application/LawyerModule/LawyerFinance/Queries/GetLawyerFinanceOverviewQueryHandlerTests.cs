using LawMate.Application.LawyerModule.LawyerFinance.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using LawMate.Tests.Common;

namespace LawMate.Tests.Application.LawyerModule.LawyerFinance.Queries;

public class GetLawyerFinanceOverviewQueryHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly GetLawyerFinanceOverviewQueryHandler _handler;

    public GetLawyerFinanceOverviewQueryHandlerTests()
    {
        _context = TestDbContextFactory.Create("OverviewTestDb");
        _handler = new GetLawyerFinanceOverviewQueryHandler(_context);
    }

    private async Task SeedData()
    {
        var now = DateTime.UtcNow;

        _context.BOOKING_PAYMENT.AddRange(
            new BOOKING_PAYMENT { Id = 1, LawyerId = "lawyer1", VerificationStatus = VerificationStatus.Verified, IsPaid = true, LawyerFee = 100, VerifiedAt = now.AddDays(-3) },
            new BOOKING_PAYMENT { Id = 2, LawyerId = "lawyer1", VerificationStatus = VerificationStatus.Verified, IsPaid = false, LawyerFee = 200, VerifiedAt = now.AddDays(-2) },
            new BOOKING_PAYMENT { Id = 3, LawyerId = "lawyer1", VerificationStatus = VerificationStatus.Pending, IsPaid = false, LawyerFee = 150 },
            new BOOKING_PAYMENT { Id = 4, LawyerId = "lawyer1", VerificationStatus = VerificationStatus.Rejected, IsPaid = false, LawyerFee = 50 }
        );

        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task Handle_ShouldReturnCorrectOverview()
    {
        await SeedData();

        var query = new GetLawyerFinanceOverviewQuery("lawyer1");
        var result = await _handler.Handle(query, CancellationToken.None);

        // Verified payments
        Assert.Equal(100 + 200, result.TotalEarnings);

        // Verified payments this month
        var monthStart = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var expectedThisMonth = result.TotalEarnings; // all verified payments are in current month
        Assert.Equal(expectedThisMonth, result.ThisMonth);

        // Pending payments
        Assert.Equal(150, result.PendingVerification);

        // TransferredToBank (IsPaid)
        Assert.Equal(100, result.TransferredToBank);
    }

    [Fact]
    public async Task Handle_ShouldReturnZeros_WhenNoPayments()
    {
        var query = new GetLawyerFinanceOverviewQuery("lawyerX");
        var result = await _handler.Handle(query, CancellationToken.None);

        Assert.Equal(0, result.TotalEarnings);
        Assert.Equal(0, result.ThisMonth);
        Assert.Equal(0, result.PendingVerification);
        Assert.Equal(0, result.TransferredToBank);
    }
}