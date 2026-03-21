using LawMate.Application.ClientModule.ClientBookings.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.ClientModule.ClientBooking.Queries
{
    public class GetPaymentSlipQueryHandlerTests
    {
        private IApplicationDbContext GetContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options;
            return new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Handle_Should_Return_Null_When_Booking_NotFound()
        {
            var context = GetContext(nameof(Handle_Should_Return_Null_When_Booking_NotFound));
            var handler = new GetPaymentSlipQueryHandler(context);
            var query = new GetPaymentSlipQuery(1, "C1");

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_Should_Return_Null_When_No_Payment_Exists()
        {
            var context = GetContext(nameof(Handle_Should_Return_Null_When_No_Payment_Exists));
            context.BOOKING.Add(new BOOKING
            {
                BookingId = 1,
                ClientId = "C1",
                LawyerId = "L1"
            });
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new GetPaymentSlipQueryHandler(context);
            var query = new GetPaymentSlipQuery(1, "C1");

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_Should_Return_PaymentSlip_Result_Successfully()
        {
            var context = GetContext(nameof(Handle_Should_Return_PaymentSlip_Result_Successfully));

            var booking = new BOOKING { BookingId = 1, ClientId = "C1", LawyerId = "L1" };
            context.BOOKING.Add(booking);

            var imageBytes = new byte[] { 1, 2, 3, 4, 5 };

            var payment = new BOOKING_PAYMENT
            {
                BookingId = 1,
                VerificationStatus = VerificationStatus.Pending,
                ReceiptDocument = imageBytes,
                CreatedAt = DateTime.UtcNow.AddMinutes(-5)
            };

            context.BOOKING_PAYMENT.Add(payment);
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new GetPaymentSlipQueryHandler(context);
            var query = new GetPaymentSlipQuery(1, "C1");

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.NotNull(result);
            Assert.Equal(payment.Id, result!.PaymentId);
            Assert.Equal(Convert.ToBase64String(imageBytes), result.SlipImageBase64);
            Assert.Equal("Pending", result.VerificationStatus);
            Assert.Equal(payment.CreatedAt, result.CreatedAt);
        }

        [Fact]
        public async Task Handle_Should_Map_VerificationStatus_Correctly()
        {
            var context = GetContext(nameof(Handle_Should_Map_VerificationStatus_Correctly));

            context.BOOKING.Add(new BOOKING { BookingId = 1, ClientId = "C1", LawyerId = "L1" });

            context.BOOKING_PAYMENT.AddRange(
                new BOOKING_PAYMENT
                {
                    BookingId = 1,
                    VerificationStatus = VerificationStatus.Verified,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-2)
                },
                new BOOKING_PAYMENT
                {
                    BookingId = 1,
                    VerificationStatus = VerificationStatus.Rejected,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-1)
                }
            );

            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new GetPaymentSlipQueryHandler(context);

            // Should pick the latest payment (CreatedAt descending)
            var result = await handler.Handle(new GetPaymentSlipQuery(1, "C1"), CancellationToken.None);

            Assert.NotNull(result);
            Assert.Equal("Rejected", result!.VerificationStatus);
        }
    }
}