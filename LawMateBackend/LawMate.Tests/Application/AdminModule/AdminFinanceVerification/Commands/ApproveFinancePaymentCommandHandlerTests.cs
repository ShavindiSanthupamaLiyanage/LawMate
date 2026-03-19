using System;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Application.AdminModule.FinanceVerification.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.AdminModule.FinanceVerification
{
    public class ApproveFinancePaymentCommandHandlerTests
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
                SlipNumber = null,
                VerificationStatus = VerificationStatus.Pending,
                VerifiedBy = null,
                IsPaid = false
            });

            context.SaveChanges();
            return context;
        }

        [Fact]
        public async Task Handle_ApprovesPayment_ReturnsSuccessMessage()
        {
            // Arrange
            var dbContext = CreateDbContext();
            var handler = new ApproveFinancePaymentCommandHandler(dbContext);

            var command = new ApproveFinancePaymentCommand(
                BookingId: 1,
                VerifiedBy: "admin123",
                slipNo: "SLIP456"
            );

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert return value
            Assert.Equal("Payment approved successfully", result);

            // Assert database updated
            var payment = await dbContext.BOOKING_PAYMENT.FirstOrDefaultAsync(x => x.BookingId == 1);
            Assert.NotNull(payment);
            Assert.Equal("SLIP456", payment.SlipNumber);
            Assert.Equal(VerificationStatus.Verified, payment.VerificationStatus);
            Assert.Equal("admin123", payment.VerifiedBy);
            Assert.True(payment.IsPaid);
            Assert.NotNull(payment.VerifiedAt);
        }

        [Fact]
        public async Task Handle_PaymentNotFound_ThrowsException()
        {
            // Arrange
            var dbContext = CreateDbContext();
            var handler = new ApproveFinancePaymentCommandHandler(dbContext);

            var command = new ApproveFinancePaymentCommand(
                BookingId: 999, // Non-existent booking
                VerifiedBy: "admin123",
                slipNo: "SLIP999"
            );

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("Payment not found", ex.Message);
        }
    }
}