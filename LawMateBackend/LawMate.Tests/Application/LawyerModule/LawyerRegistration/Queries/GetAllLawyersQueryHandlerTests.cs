using FluentAssertions;
using LawMate.Application.LawyerModule.LawyerRegistration.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Tests.Common;

namespace LawMate.Tests.Application.LawyerModule.LawyerRegistration.Queries;

public class GetAllLawyersQueryHandlerTests
{
    [Fact]
    public async Task Handle_Should_Return_All_Lawyers()
    {
        // Arrange
        var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

        var user = new USER_DETAIL
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@test.com",
            UserRole = UserRole.Lawyer
        };

        // Set private UserId
        typeof(USER_DETAIL)
            .GetProperty("UserId", System.Reflection.BindingFlags.Instance | 
                                   System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public)!
            .SetValue(user, "U1");

        context.USER_DETAIL.Add(user);

        var lawyer = new LAWYER_DETAILS
        {
            UserId = "U1",
            SCECertificateNo = "CERT123",
            YearOfExperience = 5
        };

        context.LAWYER_DETAILS.Add(lawyer);

        await context.SaveChangesAsync();

        var handler = new GetAllLawyersQueryHandler(context);

        // Act
        var result = await handler.Handle(new GetAllLawyersQuery(), CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(1);
        result[0].FirstName.Should().Be("John");
        result[0].SCECertificateNo.Should().Be("CERT123");
    }
}