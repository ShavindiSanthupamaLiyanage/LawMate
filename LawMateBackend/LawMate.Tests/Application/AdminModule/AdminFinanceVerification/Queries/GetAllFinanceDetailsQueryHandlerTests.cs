using LawMate.Application.AdminModule.AdminFinanceVerification.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.AdminModule.AdminFinanceVerification.Queries
{
    public class GetAllFinanceDetailsQueryHandlerTests
    {
        private IApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
        
            var context = new ApplicationDbContext(options);
        
            // Seed users
            context.USER_DETAIL.Add(new Domain.Entities.Auth.USER_DETAIL
            {
                UserId = "lawyer1",
                FirstName = "Sunil",
                LastName = "Gamage",
                NIC = "123456789V",
                Email = "sunil@example.com",
                ContactNumber = "0771234567",
                UserRole = Domain.Common.Enums.UserRole.Lawyer
            });
        
            context.USER_DETAIL.Add(new Domain.Entities.Auth.USER_DETAIL
            {
                UserId = "client1",
                FirstName = "Kamal",
                LastName = "Perera",
                NIC = "987654321V",
                Email = "kamal@example.com",
                ContactNumber = "0777654321",
                UserRole = Domain.Common.Enums.UserRole.Client
            });
        
            // Seed bookings
            context.BOOKING.Add(new BOOKING
            {
                BookingId = 1,
                ClientId = "client1",
                LawyerId = "lawyer1",
                ScheduledDateTime = DateTime.UtcNow.AddDays(1),
                Duration = 60
            });
        
            // Seed payments
            context.BOOKING_PAYMENT.AddRange(new List<BOOKING_PAYMENT>
            {
                new BOOKING_PAYMENT
                {
                    BookingId = 1,
                    LawyerId = "lawyer1",
                    TransactionId = "TXN001",
                    Amount = 5000,
                    PaymentDate = DateTime.UtcNow,
                    VerificationStatus = VerificationStatus.Pending,
                    PlatformCommission = 500,
                    LawyerFee = 4500,
                    IsPaid = false
                },
                new BOOKING_PAYMENT
                {
                    BookingId = 1,
                    LawyerId = "lawyer1",
                    TransactionId = "TXN002",
                    Amount = 7000,
                    PaymentDate = DateTime.UtcNow,
                    VerificationStatus = VerificationStatus.Verified,
                    PlatformCommission = 700,
                    LawyerFee = 6300,
                    IsPaid = true
                }
            });
        
            context.SaveChanges();
            return context;
        }

        [Fact]
        public async Task Handle_ReturnsFinanceDetails_ForPendingAndVerifiedPayments()
        {
            // Arrange
            var dbContext = CreateDbContext();
            var handler = new GetAllFinanceDetailsQueryHandler(dbContext);
            var query = new GetAllFinanceDetailsQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            var list = Assert.IsType<List<FinanceDetailsDto>>(result);
            Assert.Equal(2, list.Count);

            var first = list[0];
            Assert.Equal("lawyer1", first.LawyerId);
            Assert.Equal("Sunil Gamage", first.FullName);
            Assert.Equal(5000, first.Amount);
            Assert.Equal(VerificationStatus.Pending, first.VerificationStatus);

            var second = list[1];
            Assert.Equal("lawyer1", second.LawyerId);
            Assert.Equal("Sunil Gamage", second.FullName);
            Assert.Equal(7000, second.Amount);
            Assert.Equal(VerificationStatus.Verified, second.VerificationStatus);
        }
    }
}