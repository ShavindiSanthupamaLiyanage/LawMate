using FluentAssertions;
using LawMate.Application.AdminModule.AdminRegistration.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Moq;

namespace LawMate.Tests.Application.AdminModule.AdminRegistration.Queries;

public class GetAdminByUserIdQueryHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IAppLogger> _loggerMock;
    private readonly GetAdminByUserIdQueryHandler _handler;

    public GetAdminByUserIdQueryHandlerTests()
    {
        _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        _loggerMock = new Mock<IAppLogger>();

        _handler = new GetAdminByUserIdQueryHandler(_context, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Return_Admin_When_Found()
    {
        // Arrange
        var user = new USER_DETAIL
        {
            FirstName = "John",
            LastName = "Doe",
            Email = "john@test.com",
            NIC = "123456789V",
            ContactNumber = "077",
            RecordStatus = 1,
            State = State.Active,
            UserRole = UserRole.Admin
        };

        // Set private UserId (if needed)
        typeof(USER_DETAIL)
            .GetProperty("UserId",
                System.Reflection.BindingFlags.Instance |
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Public)!
            .SetValue(user, "A1");

        _context.USER_DETAIL.Add(user);
        await _context.SaveChangesAsync();

        var query = new GetAdminByUserIdQuery { UserId = "A1" };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result!.UserId.Should().Be("A1");
        result.FirstName.Should().Be("John");
    }

    [Fact]
    public async Task Handle_Should_Return_Null_When_Admin_Not_Found()
    {
        // Arrange
        var query = new GetAdminByUserIdQuery { UserId = "NOT_EXIST" };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_Should_Not_Return_When_User_Is_Not_Admin()
    {
        // Arrange
        var user = new USER_DETAIL
        {
            FirstName = "ClientUser",
            UserRole = UserRole.Client, 
            State = State.Active
        };

        typeof(USER_DETAIL)
            .GetProperty("UserId",
                System.Reflection.BindingFlags.Instance |
                System.Reflection.BindingFlags.NonPublic |
                System.Reflection.BindingFlags.Public)!
            .SetValue(user, "C1");

        _context.USER_DETAIL.Add(user);
        await _context.SaveChangesAsync();

        var query = new GetAdminByUserIdQuery { UserId = "C1" };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
    }
}