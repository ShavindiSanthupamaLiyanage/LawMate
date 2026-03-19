using LawMate.Application.AdminModule.FinanceVerification.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.AdminModule.AdminFinanceVerification.Queries
{
    public class GetPaidFinanceQueryHandlerTests
    {
        private IApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);

            // Seed BOOKING_PAYMENT data
            context.BOOKING_PAYMENT.AddRange(
                new BOOKING_PAYMENT
                {
                    BookingId = 1,
                    LawyerId = "lawyer1",
                    TransactionId = "TXN001",
                    Amount = 5000,
                    LawyerFee = 4500,
                    VerificationStatus = VerificationStatus.Verified,
                    IsPaid = true
                },
                new BOOKING_PAYMENT
                {
                    BookingId = 2,
                    LawyerId = "lawyer1",
                    TransactionId = "TXN002",
                    Amount = 3000,
                    LawyerFee = 2700,
                    VerificationStatus = VerificationStatus.Verified,
                    IsPaid = false
                },
                new BOOKING_PAYMENT
                {
                    BookingId = 3,
                    LawyerId = "lawyer2",
                    TransactionId = "TXN003",
                    Amount = 4000,
                    LawyerFee = 3600,
                    VerificationStatus = VerificationStatus.Verified,
                    IsPaid = true
                }
            );

            context.SaveChanges();
            return context;
        }

        [Fact]
        public async Task Handle_ReturnsOnlyPaidLawyersWithCorrectTotals()
        {
            // Arrange
            var context = CreateDbContext();
            var handler = new GetPaidFinanceQueryHandler(context);

            // Act
            var result = await handler.Handle(new GetPaidFinanceQuery(), CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count); // Only lawyers with IsPaid=true

            var lawyer1 = result.FirstOrDefault(x => x.LawyerId == "lawyer1");
            var lawyer2 = result.FirstOrDefault(x => x.LawyerId == "lawyer2");

            Assert.NotNull(lawyer1);
            Assert.NotNull(lawyer2);

            // Only sum paid LawyerFee
            Assert.Equal(4500, lawyer1.TotalLawyerFee);
            Assert.Equal(3600, lawyer2.TotalLawyerFee);
        }
    }
}