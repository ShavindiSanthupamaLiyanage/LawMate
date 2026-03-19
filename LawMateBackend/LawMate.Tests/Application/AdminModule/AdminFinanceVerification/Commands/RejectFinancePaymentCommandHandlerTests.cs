using LawMate.Application.AdminModule.FinanceVerification.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.AdminModule.AdminFinanceVerification.Commands
{
    public class RejectFinancePaymentCommandHandlerTests
    {
        private IApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);

            // Seed a booking payment
            context.BOOKING_PAYMENT.Add(new BOOKING_PAYMENT
            {
                BookingId = 1,
                VerificationStatus = VerificationStatus.Pending
            });

            context.SaveChanges();
            return context;
        }

        [Fact]
        public async Task Handle_RejectsPayment_ReturnsSuccessMessage()
        {
            // Arrange
            var dbContext = CreateDbContext();
            var handler = new RejectFinancePaymentCommandHandler(dbContext);

            var command = new RejectFinancePaymentCommand(
                BookingId: 1,
                RejectionReason: "Invalid payment",
                VerifiedBy: "admin123"
            );

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert return value
            Assert.Equal("Payment rejected successfully", result);

            // Assert database updated
            var payment = await dbContext.BOOKING_PAYMENT.FirstOrDefaultAsync(x => x.BookingId == 1);
            Assert.NotNull(payment);
            Assert.Equal(VerificationStatus.Rejected, payment.VerificationStatus);
            Assert.Equal("Invalid payment", payment.RejectionReason);
            Assert.Equal("admin123", payment.VerifiedBy);
            Assert.NotNull(payment.VerifiedAt);
        }

        [Fact]
        public async Task Handle_PaymentNotFound_ThrowsException()
        {
            // Arrange
            var dbContext = CreateDbContext();
            var handler = new RejectFinancePaymentCommandHandler(dbContext);

            var command = new RejectFinancePaymentCommand(
                BookingId: 999, // Non-existent booking
                RejectionReason: "Invalid",
                VerifiedBy: "admin123"
            );

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("Payment not found", ex.Message);
        }
    }
}