using LawMate.Application.AdminModule.AdminReports.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Infrastructure;
using LawMate.Tests.Common;

namespace LawMate.Tests.Application.AdminModule.AdminReports.Queries
{
    public class GetMonthlyRevenueReportQueryHandlerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly GetMonthlyRevenueReportQueryHandler _handler;

        public GetMonthlyRevenueReportQueryHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
            _handler = new GetMonthlyRevenueReportQueryHandler(_context);

            SeedData().Wait();
        }

        private async Task SeedData()
        {
            var now = DateTime.Now;

            // Bookings for two months
            var booking1 = new BOOKING
            {
                BookingId = 1,
                ClientId = "client1",  // required
                LawyerId = "lawyer1",  // required
                ScheduledDateTime = now.AddDays(-10),
                BookingStatus = BookingStatus.Verified,
                PaymentStatus = PaymentStatus.Paid,
                Amount = 100
            };

            var booking2 = new BOOKING
            {
                BookingId = 2,
                ClientId = "client2",
                LawyerId = "lawyer2",
                ScheduledDateTime = now.AddDays(-9),
                BookingStatus = BookingStatus.Rejected,
                PaymentStatus = PaymentStatus.Pending,
                Amount = 200
            };

            var booking3 = new BOOKING
            {
                BookingId = 3,
                ClientId = "client3",
                LawyerId = "lawyer1",
                ScheduledDateTime = now.AddMonths(-1),
                BookingStatus = BookingStatus.Verified,
                PaymentStatus = PaymentStatus.Paid,
                Amount = 150
            };

            // Membership payments
            var membership1 = new MEMBERSHIP_PAYMENT
            {
                TransactionId = "7646",
                LawyerId = "lawyer1",
                Amount = 500,
                VerificationStatus = VerificationStatus.Verified,
                PaymentDate = now.AddDays(-5)
            };
            var membership2 = new MEMBERSHIP_PAYMENT
            {
                TransactionId = "8921",
                LawyerId = "lawyer2",
                Amount = 300,
                VerificationStatus = VerificationStatus.Verified,
                PaymentDate = now.AddMonths(-1)
            };
            var membership3 = new MEMBERSHIP_PAYMENT
            {
                TransactionId = "4539",
                LawyerId = "lawyer3",
                Amount = 400,
                VerificationStatus = VerificationStatus.Pending, // should not count
                PaymentDate = now
            };

            // New lawyer registrations
            var lawyer1 = new USER_DETAIL
            {
                UserId = "lawyer1",
                FirstName = "John",
                UserRole = UserRole.Lawyer,
                RegistrationDate = now.AddDays(-7)
            };
            var lawyer2 = new USER_DETAIL
            {
                UserId = "lawyer2",
                FirstName = "Jane",
                UserRole = UserRole.Lawyer,
                RegistrationDate = now.AddMonths(-1)
            };
            var lawyer3 = new USER_DETAIL
            {
                UserId = "lawyer3",
                FirstName = "Bob",
                UserRole = UserRole.Lawyer,
                RegistrationDate = now.AddMonths(-2)
            };

            await _context.BOOKING.AddRangeAsync(booking1, booking2, booking3);
            await _context.MEMBERSHIP_PAYMENT.AddRangeAsync(membership1, membership2, membership3);
            await _context.USER_DETAIL.AddRangeAsync(lawyer1, lawyer2, lawyer3);

            await _context.SaveChangesAsync();
        }

        [Fact]
        public async Task Handle_ShouldReturnMonthlyRevenueReportCorrectly()
        {
            // Arrange
            var query = new GetMonthlyRevenueReportQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);
            var list = result.ToList();

            // Assert that we have reports for two months
            Assert.True(list.Count >= 2);

            // Current month
            var currentMonthReport = list.First(r => r.Month == DateTime.Now.Month && r.Year == DateTime.Now.Year);
            Assert.Equal(2, currentMonthReport.TotalBookings); 
            Assert.Equal(1, currentMonthReport.CompletedBookings); 
            Assert.Equal(1, currentMonthReport.CancelledBookings);
            Assert.Equal(100, currentMonthReport.TotalRevenue); 
            Assert.Equal(200, currentMonthReport.PendingRevenue); 
            Assert.Equal(500, currentMonthReport.MembershipRevenue); 
            Assert.Equal(1, currentMonthReport.NewLawyers);

            // Previous month
            var prevMonth = DateTime.Now.AddMonths(-1);
            var prevMonthReport = list.First(r => r.Month == prevMonth.Month && r.Year == prevMonth.Year);
            Assert.Equal(1, prevMonthReport.TotalBookings); 
            Assert.Equal(1, prevMonthReport.CompletedBookings);
            Assert.Equal(0, prevMonthReport.CancelledBookings); 
            Assert.Equal(150, prevMonthReport.TotalRevenue); 
            Assert.Equal(0, prevMonthReport.PendingRevenue);
            Assert.Equal(300, prevMonthReport.MembershipRevenue); 
            Assert.Equal(1, prevMonthReport.NewLawyers); 
        }
    }
}