using LawMate.Application.ClientModule.ClientBooking.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using LawMate.Tests.Common;

namespace LawMate.Tests.Application.LawyerModule.LawyerBooking.Queries
{
    public class GetClientAppointmentsQueryHandlerTests
    {
        private ApplicationDbContext GetContext(string dbName) =>
            TestDbContextFactory.Create(dbName);

        [Fact]
        public async Task Handle_Should_Return_Appointments_For_Client()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Return_Appointments_For_Client));

            // Add client
            var client = new USER_DETAIL
            {
                UserId = "CL1",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                ContactNumber = "123456789",
                UserRole = UserRole.Client
            };

            // Add lawyer
            var lawyer = new USER_DETAIL
            {
                UserId = "LAW1",
                FirstName = "Alice",
                LastName = "Smith",
                UserRole = UserRole.Lawyer
            };

            // Add timeslot
            var slot = new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "LAW1",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = false
            };

            // Add booking
            var booking = new BOOKING
            {
                BookingId = 1,
                ClientId = "CL1",
                LawyerId = "LAW1",
                TimeSlotId = 1,
                ScheduledDateTime = DateTime.Today.AddHours(9),
                Duration = 60,
                IssueDescription = "Test case",
                BookingStatus = BookingStatus.Pending,
                PaymentStatus = PaymentStatus.Pending,
                CaseType = LegalCategory.FamilyLaw,
                Mode = AppointmentMode.Online,
                CreatedBy = "CL1",
                CreatedAt = DateTime.UtcNow
            };

            context.USER_DETAIL.AddRange(client, lawyer);
            context.TIMESLOT.Add(slot);
            context.BOOKING.Add(booking);
            await context.SaveChangesAsync();

            var handler = new GetClientAppointmentsQueryHandler(context);
            var query = new GetClientAppointmentsQuery("CL1");

            // Act
            var result = await handler.Handle(query, default);

            // Assert
            Assert.Single(result);
            var appointment = result.First();
            Assert.Equal(1, appointment.BookingId);
            Assert.Equal("John Doe", appointment.ClientName);
            Assert.Equal("Family Law", appointment.CaseType);
            Assert.Equal("Pending", appointment.Status);
            // Assert.Equal("2023", appointment.StartTime.Substring(0, 4)); // ISO string check
            Assert.Equal(DateTime.Today.Year.ToString(), appointment.StartTime.Substring(0, 4));
        }

        [Fact]
        public async Task Handle_Should_Return_Empty_List_If_No_Bookings()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Return_Empty_List_If_No_Bookings));

            // Add a client with no bookings
            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "CL2",
                FirstName = "Empty",
                LastName = "Client",
                UserRole = UserRole.Client
            });

            await context.SaveChangesAsync();

            var handler = new GetClientAppointmentsQueryHandler(context);
            var query = new GetClientAppointmentsQuery("CL2");

            // Act
            var result = await handler.Handle(query, default);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task Handle_Should_Order_Appointments_By_ScheduledDateTime_Descending()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Order_Appointments_By_ScheduledDateTime_Descending));

            var client = new USER_DETAIL
            {
                UserId = "CL3",
                FirstName = "Order",
                LastName = "Test",
                UserRole = UserRole.Client
            };

            var lawyer = new USER_DETAIL
            {
                UserId = "LAW2",
                FirstName = "Law",
                LastName = "Test",
                UserRole = UserRole.Lawyer
            };

            var slot1 = new TIMESLOT
            {
                TimeSlotId = 1,
                LawyerId = "LAW2",
                StartTime = DateTime.Today.AddHours(9),
                EndTime = DateTime.Today.AddHours(10),
                IsAvailable = false
            };

            var slot2 = new TIMESLOT
            {
                TimeSlotId = 2,
                LawyerId = "LAW2",
                StartTime = DateTime.Today.AddHours(11),
                EndTime = DateTime.Today.AddHours(12),
                IsAvailable = false
            };

            var booking1 = new BOOKING
            {
                BookingId = 1,
                ClientId = "CL3",
                LawyerId = "LAW2",
                TimeSlotId = 1,
                ScheduledDateTime = DateTime.Today.AddHours(9),
                Duration = 60,
                BookingStatus = BookingStatus.Pending,
                PaymentStatus = PaymentStatus.Pending,
                CaseType = LegalCategory.CriminalLaw,
                Mode = AppointmentMode.Online,
                CreatedBy = "CL3",
                CreatedAt = DateTime.UtcNow
            };

            var booking2 = new BOOKING
            {
                BookingId = 2,
                ClientId = "CL3",
                LawyerId = "LAW2",
                TimeSlotId = 2,
                ScheduledDateTime = DateTime.Today.AddHours(11),
                Duration = 60,
                BookingStatus = BookingStatus.Accepted,
                PaymentStatus = PaymentStatus.Pending,
                CaseType = LegalCategory.Cyber,
                Mode = AppointmentMode.Online,
                CreatedBy = "CL3",
                CreatedAt = DateTime.UtcNow
            };

            context.USER_DETAIL.AddRange(client, lawyer);
            context.TIMESLOT.AddRange(slot1, slot2);
            context.BOOKING.AddRange(booking1, booking2);
            await context.SaveChangesAsync();

            var handler = new GetClientAppointmentsQueryHandler(context);
            var query = new GetClientAppointmentsQuery("CL3");

            // Act
            var result = await handler.Handle(query, default);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal(2, result[0].BookingId); // latest first
            Assert.Equal(1, result[1].BookingId);
        }
    }
}