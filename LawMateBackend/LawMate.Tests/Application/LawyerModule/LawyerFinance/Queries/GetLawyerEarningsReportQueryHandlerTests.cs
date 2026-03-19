using LawMate.Application.LawyerModule.LawyerFinance.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.LawyerModule.LawyerFinance.Queries
{
    public class GetLawyerEarningsReportQueryHandlerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly GetLawyerEarningsReportQueryHandler _handler;

        public GetLawyerEarningsReportQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _handler = new GetLawyerEarningsReportQueryHandler(_context);
        }

        private async Task SeedData()
        {
            var bookings = new List<BOOKING>
            {
                new() { BookingId = 1, LawyerId = "lawyer1", ClientId = "client1" },
                new() { BookingId = 2, LawyerId = "lawyer1", ClientId = "client2" },
                new() { BookingId = 3, LawyerId = "lawyer1", ClientId = "client3" },
            };

            var payments = new List<BOOKING_PAYMENT>
            {
                new() { Id = 1, BookingId = 1, LawyerId = "lawyer1", PaymentDate = DateTime.UtcNow.AddDays(-1), VerificationStatus = VerificationStatus.Verified, LawyerFee = 100, IsPaid = true },
                new() { Id = 2, BookingId = 2, LawyerId = "lawyer1", PaymentDate = DateTime.UtcNow.AddDays(-2), VerificationStatus = VerificationStatus.Verified, LawyerFee = 200, IsPaid = false },
                new() { Id = 3, BookingId = 3, LawyerId = "lawyer1", PaymentDate = DateTime.UtcNow.AddDays(-3), VerificationStatus = VerificationStatus.Pending, LawyerFee = 150, IsPaid = false },
                new() { Id = 4, BookingId = 999, LawyerId = "lawyer1", PaymentDate = DateTime.UtcNow.AddDays(-4), VerificationStatus = VerificationStatus.Verified, LawyerFee = 50, IsPaid = true }, // Booking missing → Unknown client
                new() { Id = 5, BookingId = 1, LawyerId = "lawyer1", PaymentDate = DateTime.UtcNow.AddDays(-10), VerificationStatus = VerificationStatus.Rejected, LawyerFee = 80, IsPaid = false },
            };

            _context.BOOKING.AddRange(bookings);
            _context.BOOKING_PAYMENT.AddRange(payments);
            await _context.SaveChangesAsync();
        }

        [Fact]
        public async Task Handle_ShouldCalculateReport_DefaultDates()
        {
            await SeedData();

            var query = new GetLawyerEarningsReportQuery("lawyer1");
            var result = await _handler.Handle(query, CancellationToken.None);

            Assert.Equal(4, result.TotalSessions); 
            Assert.Equal(100 + 200 + 150 + 50, result.TotalEarnings);
            Assert.Equal(100 + 200 + 50, result.VerifiedAmount);
            Assert.Equal(200, result.PendingAmount); 
            Assert.Equal(100 + 50, result.TransferredAmount); 

            Assert.Contains(result.TopClients, x => x.ClientId == "client1" && x.Amount == 100);
            Assert.Contains(result.TopClients, x => x.ClientId == "client2" && x.Amount == 200);
            Assert.Contains(result.TopClients, x => x.ClientId == "Unknown" && x.Amount == 50);
        }
        
        [Theory]
        [InlineData("thisweek")]
        [InlineData("thismonth")]
        [InlineData("lastmonth")]
        public async Task Handle_ShouldSupportPresets(string preset)
        {
            await SeedData();

            var query = new GetLawyerEarningsReportQuery("lawyer1", Preset: preset);
            var result = await _handler.Handle(query, CancellationToken.None);

            // Basic assertion: result is not null and has top clients
            Assert.NotNull(result);
            Assert.True(result.TopClients.Count <= 5);
        }

        [Fact]
        public async Task Handle_ShouldReturnZero_WhenNoPayments()
        {
            // No seeding
            var query = new GetLawyerEarningsReportQuery("lawyer-no-payments");
            var result = await _handler.Handle(query, CancellationToken.None);

            Assert.Equal(0, result.TotalSessions);
            Assert.Equal(0, result.TotalEarnings);
            Assert.Equal(0, result.VerifiedAmount);
            Assert.Equal(0, result.PendingAmount);
            Assert.Equal(0, result.TransferredAmount);
            Assert.Empty(result.TopClients);
        }

        [Fact]
        public async Task Handle_ShouldFilterByStartAndEndDate()
        {
            await SeedData();

            var start = DateTime.UtcNow.AddDays(-3);
            var end = DateTime.UtcNow.AddDays(-1);

            var query = new GetLawyerEarningsReportQuery("lawyer1", StartDate: start, EndDate: end);
            var result = await _handler.Handle(query, CancellationToken.None);

            // Should include only payments with PaymentDate between start and end
            Assert.All(result.TopClients, x => Assert.True(x.Amount >= 0));
            Assert.True(result.TotalSessions > 0);
        }
    }
}