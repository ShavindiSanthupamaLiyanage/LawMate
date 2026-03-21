using LawMate.Application.AdminModule.AdminReports.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Infrastructure;
using LawMate.Tests.Common;

namespace LawMate.Tests.Application.AdminModule.AdminReports.Queries
{
    public class GetLawyerDetailReportQueryHandlerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly GetLawyerDetailReportQueryHandler _handler;

        public GetLawyerDetailReportQueryHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
            _handler = new GetLawyerDetailReportQueryHandler(_context);

            SeedData().Wait();
        }

        private async Task SeedData()
        {
            // Lawyer with membership
            var user1 = new USER_DETAIL
            {
                UserId = "lawyer1",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                UserRole = UserRole.Lawyer,
                Prefix = Domain.Common.Enums.Prefix.Mr,
                Gender = Gender.Male,
                RegistrationDate = DateTime.UtcNow.AddDays(-10),
                State = State.Active
            };

            var lawyer1 = new LAWYER_DETAILS
            {
                UserId = "lawyer1",
                SCECertificateNo = "SCE123",
                Bio = "Experienced lawyer",
                ProfessionalDesignation = "Attorney",
                YearOfExperience = 5,
                WorkingDistrict = Domain.Common.Enums.District.Colombo,
                AreaOfPractice = Domain.Common.Enums.AreaOfPractice.Civil,
                BarAssociationMembership = true,
                BarAssociationRegNo = "BAR001",
                AverageRating = 4,
                VerificationStatus = VerificationStatus.Verified
            };

            var membership1 = new MEMBERSHIP_PAYMENT
            {
                LawyerId = "lawyer1",
                MembershipStartDate = DateTime.UtcNow.AddMonths(-1),
                MembershipEndDate = DateTime.UtcNow.AddMonths(11),
                IsExpired = false,
                VerificationStatus = VerificationStatus.Verified
            };

            // Lawyer without membership
            var user2 = new USER_DETAIL
            {
                UserId = "lawyer2",
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane@example.com",
                UserRole = UserRole.Lawyer,
                Prefix = Domain.Common.Enums.Prefix.Ms,
                Gender = Gender.Female,
                RegistrationDate = DateTime.UtcNow.AddDays(-5),
                State = State.Active
            };

            var lawyer2 = new LAWYER_DETAILS
            {
                UserId = "lawyer2",
                SCECertificateNo = "SCE456",
                Bio = "New lawyer",
                ProfessionalDesignation = "Counsel",
                YearOfExperience = 2,
                WorkingDistrict = Domain.Common.Enums.District.Gampaha,
                AreaOfPractice = Domain.Common.Enums.AreaOfPractice.Criminal,
                BarAssociationMembership = false,
                BarAssociationRegNo = null,
                AverageRating = 3,
                VerificationStatus = VerificationStatus.Pending
            };

            await _context.USER_DETAIL.AddRangeAsync(user1, user2);
            await _context.LAWYER_DETAILS.AddRangeAsync(lawyer1, lawyer2);
            await _context.MEMBERSHIP_PAYMENT.AddAsync(membership1);

            await _context.SaveChangesAsync();
        }

        [Fact]
        public async Task Handle_ShouldReturnAllLawyersWithCorrectMembershipInfo()
        {
            // Arrange
            var query = new GetLawyerDetailReportQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            var list = result.ToList();
            Assert.Equal(2, list.Count);

            // Lawyer1 has membership
            var lawyer1 = list.First(r => r.UserId == "lawyer1");
            Assert.Equal("John", lawyer1.FirstName);
            Assert.NotNull(lawyer1.MembershipStartDate);
            Assert.False(lawyer1.MembershipExpired == null || lawyer1.MembershipExpired == true);

            // Lawyer2 has no membership
            var lawyer2 = list.First(r => r.UserId == "lawyer2");
            Assert.Equal("Jane", lawyer2.FirstName);
            Assert.Null(lawyer2.MembershipStartDate);
            Assert.Null(lawyer2.MembershipExpired);

            // Check ordering: latest registration first
            Assert.True(list[0].RegistrationDate >= list[1].RegistrationDate);
        }
    }
}