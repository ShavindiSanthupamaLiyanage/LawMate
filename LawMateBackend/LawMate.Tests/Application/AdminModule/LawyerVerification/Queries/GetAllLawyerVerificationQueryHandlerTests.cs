using LawMate.Application.AdminModule.LawyerVerification.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.AdminModule.LawyerVerification.Queries
{
    public class GetAllLawyerVerificationQueryHandlerTests
    {
        private IApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);

            // Seed sample users and lawyers
            context.USER_DETAIL.AddRange(new List<USER_DETAIL>
            {
                new USER_DETAIL
                {
                    UserId = "lawyer1",
                    FirstName = "Sunil",
                    LastName = "Gamage",
                    ProfileImage = null,
                    UserRole = UserRole.Lawyer
                },
                new USER_DETAIL
                {
                    UserId = "lawyer2",
                    FirstName = "Nimal",
                    LastName = "Perera",
                    ProfileImage = null,
                    UserRole = UserRole.Lawyer
                }
            });

            context.LAWYER_DETAILS.AddRange(new List<LAWYER_DETAILS>
            {
                new LAWYER_DETAILS
                {
                    UserId = "lawyer1",
                    SCECertificateNo = "SCE123",
                    BarAssociationRegNo = "BAR123",
                    VerificationStatus = VerificationStatus.Pending
                },
                new LAWYER_DETAILS
                {
                    UserId = "lawyer2",
                    SCECertificateNo = "SCE456",
                    BarAssociationRegNo = "BAR456",
                    VerificationStatus = VerificationStatus.Verified
                }
            });

            context.SaveChanges();
            return context;
        }

        [Fact]
        public async Task Handle_ReturnsAllLawyersMappedToDto()
        {
            // Arrange
            var dbContext = CreateDbContext();
            var handler = new GetAllLawyerVerificationQueryHandler(dbContext);
            var query = new GetAllLawyerVerificationQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);

            var lawyer1 = result.FirstOrDefault(x => x.UserId == "lawyer1");
            Assert.NotNull(lawyer1);
            Assert.Equal("Sunil Gamage", lawyer1.LawyerName);
            Assert.Equal("SCE123", lawyer1.SCECertificateNo);
            Assert.Equal("BAR123", lawyer1.BarAssociationRegNo);
            Assert.Equal(VerificationStatus.Pending, lawyer1.VerificationStatus);

            var lawyer2 = result.FirstOrDefault(x => x.UserId == "lawyer2");
            Assert.NotNull(lawyer2);
            Assert.Equal("Nimal Perera", lawyer2.LawyerName);
            Assert.Equal("SCE456", lawyer2.SCECertificateNo);
            Assert.Equal("BAR456", lawyer2.BarAssociationRegNo);
            Assert.Equal(VerificationStatus.Verified, lawyer2.VerificationStatus);
        }
    }
}