using FluentAssertions;
using LawMate.API.Controllers.Common;
using LawMate.API.Model.Common;
using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.ResetPassword.Commands;
using LawMate.Application.Common.ResetPassword.Queries;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;

namespace LawMate.Tests.Controllers.Common;

public class AuthControllerTests
{
    private readonly Mock<IConfiguration> _configMock;
    private readonly Mock<IApplicationDbContext> _contextMock;
    private readonly Mock<ICurrentUserService> _currentUserServiceMock;
    private readonly Mock<IAppLogger> _loggerMock;
    private readonly Mock<IMediator> _mediatorMock;

    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _configMock = new Mock<IConfiguration>();
        _contextMock = new Mock<IApplicationDbContext>();
        _currentUserServiceMock = new Mock<ICurrentUserService>();
        _loggerMock = new Mock<IAppLogger>();
        _mediatorMock = new Mock<IMediator>();

        _configMock.Setup(x => x["Jwt:Key"]).Returns("THIS_IS_A_SUPER_SECRET_KEY_123456789");
        _configMock.Setup(x => x["Jwt:Issuer"]).Returns("TestIssuer");
        _configMock.Setup(x => x["Jwt:Audience"]).Returns("TestAudience");
        _configMock.Setup(x => x["Jwt:ExpireMinutes"]).Returns("60");

        _controller = new AuthController(
            _configMock.Object,
            _contextMock.Object,
            _currentUserServiceMock.Object,
            _loggerMock.Object,
            _mediatorMock.Object);
    }

    // Missing credentials
    [Fact]
    public async Task Login_Should_Return_BadRequest_When_Missing_Credentials()
    {
        var request = new LoginRequest
        {
            NIC = "",
            Password = ""
        };

        var result = await _controller.Login(request);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    // Invalid NIC format
    [Fact]
    public async Task Login_Should_Return_BadRequest_When_NIC_Invalid()
    {
        var request = new LoginRequest
        {
            NIC = "INVALID",
            Password = "123"
        };

        var result = await _controller.Login(request);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    // User not found
    // [Fact]
    // public async Task Login_Should_Return_Unauthorized_When_User_Not_Found()
    // {
    //     var users = new List<USER_DETAIL>().AsQueryable();
    //
    //     var dbSetMock = new Mock<DbSet<USER_DETAIL>>();
    //     dbSetMock.As<IQueryable<USER_DETAIL>>().Setup(m => m.Provider).Returns(users.Provider);
    //     dbSetMock.As<IQueryable<USER_DETAIL>>().Setup(m => m.Expression).Returns(users.Expression);
    //     dbSetMock.As<IQueryable<USER_DETAIL>>().Setup(m => m.ElementType).Returns(users.ElementType);
    //     dbSetMock.As<IQueryable<USER_DETAIL>>().Setup(m => m.GetEnumerator()).Returns(users.GetEnumerator());
    //
    //     _contextMock.Setup(x => x.USER_DETAIL).Returns(dbSetMock.Object);
    //
    //     var request = new LoginRequest
    //     {
    //         NIC = "123456789V",
    //         Password = "pass"
    //     };
    //
    //     var result = await _controller.Login(request);
    //
    //     result.Should().BeOfType<UnauthorizedObjectResult>();
    // }
    [Fact]
    public async Task Login_Should_Return_Unauthorized_When_User_Not_Found()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase("LoginTestDb1")
            .Options;

        var dbContext = new ApplicationDbContext(options);

        var controller = new AuthController(
            _configMock.Object,
            dbContext,
            _currentUserServiceMock.Object,
            _loggerMock.Object,
            _mediatorMock.Object);

        var request = new LoginRequest
        {
            NIC = "123456789V",
            Password = "pass"
        };

        // Act
        var result = await controller.Login(request);

        // Assert
        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    // Wrong password
    [Fact]
    public async Task Login_Should_Return_Unauthorized_When_Password_Incorrect()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: "LoginWrongPasswordDb")
            .Options;

        var context = new ApplicationDbContext(options);

        var user = new USER_DETAIL
        {
            UserId = "U1",
            NIC = "123456789V",
            Password = "WRONG_HASH",
            RecordStatus = 0
        };

        context.USER_DETAIL.Add(user);
        await context.SaveChangesAsync();

        var controller = new AuthController(
            _configMock.Object,
            context,
            _currentUserServiceMock.Object,
            _loggerMock.Object,
            _mediatorMock.Object);

        var request = new LoginRequest
        {
            NIC = "123456789V",
            Password = "123"
        };

        // Act
        var result = await controller.Login(request);

        // Assert
        result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    // Reset password request
    [Fact]
    public async Task RequestReset_Should_Return_Ok()
    {
        var command = new RequestPasswordResetCommand();

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<RequestPasswordResetCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("Email sent");

        var result = await _controller.RequestReset(command);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        ok.StatusCode.Should().Be(200);
    }

    // Verify token valid
    [Fact]
    public async Task VerifyResetToken_Should_Return_Ok_When_Valid()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<VerifyResetTokenQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var result = await _controller.VerifyResetToken("token123");

        result.Should().BeOfType<OkObjectResult>();
    }

    // Verify token invalid
    [Fact]
    public async Task VerifyResetToken_Should_Return_BadRequest_When_Invalid()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<VerifyResetTokenQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var result = await _controller.VerifyResetToken("badtoken");

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    // Reset password
    [Fact]
    public async Task ResetPasswordWithToken_Should_Return_Ok()
    {
        var command = new ResetPasswordWithTokenCommand();

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<ResetPasswordWithTokenCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("Password reset");

        var result = await _controller.ResetPasswordWithToken(command);

        result.Should().BeOfType<OkObjectResult>();
    }
}