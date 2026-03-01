using FluentAssertions;
using LawMate.Application.LawyerModule.LawyerRegistration.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Tests.Common;

namespace LawMate.Tests.Application.LawyerModule.LawyerRegistration.Queries;

public class GetLawyerByUserIdQueryHandlerTest
{
    [Fact]
        public async Task Handle_ShouldReturnLawyer_WhenLawyerExists()
        {
            // Arrange
            var dbContext = TestDbContextFactory.Create(nameof(Handle_ShouldReturnLawyer_WhenLawyerExists));

            // Seed USER_DETAIL
            dbContext.USER_DETAIL.Add(new Domain.Entities.Auth.USER_DETAIL
            {
                UserId = "U1",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                NIC = "123456789V",
                Gender = Gender.Male,
                ContactNumber = "0712345678",
                RecordStatus = 0,
                State = State.Active,
                RegistrationDate = DateTime.UtcNow,
                ProfileImage = null,
                IsDualAccount = false,
            });

            // Seed LAWYER_DETAILS
            dbContext.LAWYER_DETAILS.Add(new Domain.Entities.Auth.LAWYER_DETAILS
            {
                UserId = "U1",
                SCECertificateNo = "SCE123",
                Bio = "Experienced lawyer",
                AverageRating = 4.5m,
                YearOfExperience = 5,
                WorkingDistrict = District.Kalutara,
                AreaOfPractice = AreaOfPractice.Criminal,
                VerificationStatus = VerificationStatus.Verified,
                BarAssociationRegNo = "BAR123",
                OfficeContactNumber = "0112345678",
                EnrollmentCertificate = null,
                NICFrontImage = null,
                NICBackImage = null
            });

            await dbContext.SaveChangesAsync();

            var handler = new GetLawyerByUserIdQueryHandler(dbContext);
            var query = new GetLawyerByUserIdQuery("U1");

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.UserId.Should().Be("U1");
            result.FirstName.Should().Be("John");
            result.AreaOfPractice.Should().Be(AreaOfPractice.Criminal);
            result.AverageRating.Should().Be(4.5m);
        }

        [Fact]
        public async Task Handle_ShouldThrowKeyNotFoundException_WhenLawyerDoesNotExist()
        {
            // Arrange
            var dbContext = TestDbContextFactory.Create(nameof(Handle_ShouldThrowKeyNotFoundException_WhenLawyerDoesNotExist));

            var handler = new GetLawyerByUserIdQueryHandler(dbContext);
            var query = new GetLawyerByUserIdQuery("NonExistingUser");

            // Act
            Func<Task> act = async () => await handler.Handle(query, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Lawyer not found");
        }
    
}