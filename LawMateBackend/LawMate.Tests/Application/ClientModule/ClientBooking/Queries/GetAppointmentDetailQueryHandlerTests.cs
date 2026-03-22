using LawMate.Application.ClientModule.ClientBookings.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.ClientModule.ClientBooking.Queries
{
    public class GetAppointmentDetailQueryHandlerTests
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

            var handler = new GetAppointmentDetailQueryHandler(context);
            var query = new GetAppointmentDetailQuery(1, "C1");

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_Should_Return_AppointmentDetail_Successfully()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Return_AppointmentDetail_Successfully));

            var booking = new BOOKING
            {
                BookingId = 1,
                ClientId = "C1",
                LawyerId = "L1",
                ScheduledDateTime = DateTime.Today.AddHours(10),
                Duration = 60,
                Location = "Zoom",
                BookingStatus = BookingStatus.Accepted,
                PaymentStatus = PaymentStatus.Pending,
                Amount = 2000
            };

            var lawyer = new USER_DETAIL
            {
                UserId = "L1",
                UserName = "Alice Smith"
            };

            context.BOOKING.Add(booking);
            context.USER_DETAIL.Add(lawyer);
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new GetAppointmentDetailQueryHandler(context);
            var query = new GetAppointmentDetailQuery(1, "C1");

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result!.BookingId);
            Assert.Equal("Alice Smith", result.LawyerName);
            Assert.Equal(booking.ScheduledDateTime, result.ScheduledDateTime);
            Assert.Equal(60, result.Duration);
            Assert.Equal("Zoom", result.Location);
            Assert.Equal("Accepted", result.BookingStatus);
            Assert.Equal("Pending", result.PaymentStatus);
            Assert.Equal(2000, result.Amount);

            // CanUploadSlip = true (Accepted + no pending payment)
            Assert.True(result.CanUploadSlip);
            // CanCancel = true (Accepted)
            Assert.True(result.CanCancel);
        }

        [Fact]
        public async Task Handle_Should_Set_CanUploadSlip_False_If_Payment_Pending()
        {
            var context = GetContext(nameof(Handle_Should_Set_CanUploadSlip_False_If_Payment_Pending));

            var booking = new BOOKING
            {
                BookingId = 1,
                ClientId = "C1",
                LawyerId = "L1",
                ScheduledDateTime = DateTime.Now,
                Duration = 30,
                BookingStatus = BookingStatus.Accepted
            };
            var lawyer = new USER_DETAIL { UserId = "L1", UserName = "Alice" };

            context.BOOKING.Add(booking);
            context.USER_DETAIL.Add(lawyer);
            context.BOOKING_PAYMENT.Add(new BOOKING_PAYMENT
            {
                BookingId = 1,
                VerificationStatus = VerificationStatus.Pending
            });

            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new GetAppointmentDetailQueryHandler(context);
            var query = new GetAppointmentDetailQuery(1, "C1");

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.False(result!.CanUploadSlip);
        }

        [Fact]
        public async Task Handle_Should_Set_CanCancel_Properly_Based_On_Status()
        {
            var context = GetContext(nameof(Handle_Should_Set_CanCancel_Properly_Based_On_Status));

            var booking1 = new BOOKING
            {
                BookingId = 1,
                ClientId = "C1",
                LawyerId = "L1",
                BookingStatus = BookingStatus.Pending
            };
            var booking2 = new BOOKING
            {
                BookingId = 2,
                ClientId = "C1",
                LawyerId = "L1",
                BookingStatus = BookingStatus.Accepted
            };
            var booking3 = new BOOKING
            {
                BookingId = 3,
                ClientId = "C1",
                LawyerId = "L1",
                BookingStatus = BookingStatus.Verified
            };

            context.BOOKING.AddRange(booking1, booking2, booking3);
            context.USER_DETAIL.Add(new USER_DETAIL { UserId = "L1", UserName = "Alice" });
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new GetAppointmentDetailQueryHandler(context);

            var result1 = await handler.Handle(new GetAppointmentDetailQuery(1, "C1"), CancellationToken.None);
            var result2 = await handler.Handle(new GetAppointmentDetailQuery(2, "C1"), CancellationToken.None);
            var result3 = await handler.Handle(new GetAppointmentDetailQuery(3, "C1"), CancellationToken.None);

            Assert.True(result1!.CanCancel); // Pending
            Assert.True(result2!.CanCancel); // Accepted
            Assert.False(result3!.CanCancel); // Verified
        }
    }
}