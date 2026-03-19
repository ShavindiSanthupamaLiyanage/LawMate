using FluentAssertions;
using LawMate.Application.AdminModule.AdminRegistration.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Moq;
using Xunit;

namespace LawMate.Tests.Application.AdminModule.AdminRegistration.Queries;

public class GetAllAdminsQueryHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IAppLogger> _loggerMock;
    private readonly GetAllAdminsQueryHandler _handler;

    public GetAllAdminsQueryHandlerTests()
    {
        _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        _loggerMock = new Mock<IAppLogger>();

        _handler = new GetAllAdminsQueryHandler(_context, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Return_Only_Admins()
    {
        // Arrange
        var admin1 = new USER_DETAIL { UserRole = UserRole.Admin };
        var admin2 = new USER_DETAIL { UserRole = UserRole.Admin };
        var client = new USER_DETAIL { UserRole = UserRole.Client };

        // Set UserIds (important if private setter)
        SetUserId(admin1, "A1");
        SetUserId(admin2, "A2");
        SetUserId(client, "C1");

        _context.USER_DETAIL.AddRange(admin1, admin2, client);
        await _context.SaveChangesAsync();

        var query = new GetAllAdminsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().HaveCount(2);
        result.All(x => x.UserRole == UserRole.Admin).Should().BeTrue();
    }

    [Fact]
    public async Task Handle_Should_Return_Empty_When_No_Admins()
    {
        // Arrange
        var client = new USER_DETAIL { UserRole = UserRole.Client };
        SetUserId(client, "C1");

        _context.USER_DETAIL.Add(client);
        await _context.SaveChangesAsync();

        var query = new GetAllAdminsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_Should_Order_By_UserId()
    {
        // Arrange
        var admin1 = new USER_DETAIL { UserRole = UserRole.Admin };
        var admin2 = new USER_DETAIL { UserRole = UserRole.Admin };

        SetUserId(admin1, "B2");
        SetUserId(admin2, "A1");

        _context.USER_DETAIL.AddRange(admin1, admin2);
        await _context.SaveChangesAsync();

        var query = new GetAllAdminsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.First().UserId.Should().Be("A1");
        result.Last().UserId.Should().Be("B2");
    }

    [Fact]
    public async Task Handle_Should_Log_And_Throw_When_Exception_Occurs()
    {
        // Arrange
        var contextMock = new Mock<IApplicationDbContext>();

        contextMock
            .Setup(c => c.USER_DETAIL)
            .Throws(new Exception("DB failure"));

        var handler = new GetAllAdminsQueryHandler(contextMock.Object, _loggerMock.Object);

        var query = new GetAllAdminsQuery();

        // Act
        Func<Task> act = async () => await handler.Handle(query, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<Exception>();
    }

    // Helper method (VERY IMPORTANT)
    private void SetUserId(USER_DETAIL user, string userId)
    {
        typeof(USER_DETAIL)
            .GetProperty("UserId",
                System.Reflection.BindingFlags.Instance |
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Public)!
            .SetValue(user, userId);
    }
}