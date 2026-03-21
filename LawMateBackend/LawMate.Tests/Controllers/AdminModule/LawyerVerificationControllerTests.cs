using System.Security.Claims;
using LawMate.API.Controllers.AdminModule;
using LawMate.Application.AdminModule.LawyerVerification;
using LawMate.Application.AdminModule.LawyerVerification.Commands;
using LawMate.Application.AdminModule.LawyerVerification.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.AdminModule;

public class LawyerVerificationControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly LawyerVerificationController _controller;

    public LawyerVerificationControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new LawyerVerificationController(_mediatorMock.Object);

        // Mock User Identity
        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
        {
            new Claim(ClaimTypes.Name, "admin123")
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };
    }

    [Fact]
    public async Task GetAllLawyerVerification_ReturnsOk()
    {
        _mediatorMock.Setup(m => m.Send(It.IsAny<GetAllLawyerVerificationQuery>(), default))
            .ReturnsAsync(new List<LawyerVerificationListDto>
            {
                new LawyerVerificationListDto { UserId = "lawyer1", LawyerName = "Sunil Gamage" }
            });

        var result = await _controller.GetAllLawyerVerification();

        var okResult = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsType<List<LawyerVerificationListDto>>(okResult.Value);
        Assert.Single(list);
        Assert.Equal("Sunil Gamage", list[0].LawyerName);
        Assert.Equal("lawyer1", list[0].UserId);
    }
    [Theory]
    [InlineData("Pending", VerificationStatus.Pending)]
    [InlineData("Verified", VerificationStatus.Verified)]
    [InlineData("Rejected", VerificationStatus.Rejected)]
    public async Task GetByVerificationStatus_ReturnsOk(string method, VerificationStatus status)
    {
        // Arrange: mock mediator to return a list of LawyerVerificationDto
        _mediatorMock.Setup(m => m.Send(It.IsAny<GetLawyersByVerificationStatusQuery>(), default))
            .ReturnsAsync(new List<LawyerVerificationDto>
            {
                new LawyerVerificationDto
                {
                    UserId = "lawyer1",
                    FirstName = "Sunil",
                    LastName = "Gamage",
                    SCECertificateNo = "SCE123",
                    BarAssociationRegNo = "BAR456",
                    VerificationStatus = status,
                    ProfileImage = null
                }
            });

        // Act: call the appropriate controller method
        IActionResult result = method switch
        {
            "Pending" => await _controller.GetPending(),
            "Verified" => await _controller.GetVerified(),
            "Rejected" => await _controller.GetRejected(),
            _ => null
        };

        // Assert: check OkObjectResult and returned list
        var okResult = Assert.IsType<OkObjectResult>(result);
        var list = Assert.IsType<List<LawyerVerificationDto>>(okResult.Value); // ✅ Use correct DTO type
        Assert.Single(list);
        Assert.Equal("lawyer1", list[0].UserId);
        Assert.Equal("Sunil", list[0].FirstName);
        Assert.Equal("Gamage", list[0].LastName);

        // Verify mediator was called with the correct VerificationStatus
        _mediatorMock.Verify(m => m.Send(It.Is<GetLawyersByVerificationStatusQuery>(
            q => q.VerificationStatus == status), default), Times.Once);
    }
    
    [Fact]
    public async Task Accept_ReturnsOkAndSendsCommand()
    {
        string userId = "lawyer1";

        _mediatorMock.Setup(m => m.Send(It.IsAny<AcceptLawyerVerificationCommand>(), default))
            .ReturnsAsync("Lawyer verified successfully");

        var result = await _controller.Accept(userId);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var message = Assert.IsType<string>(okResult.Value); 
        Assert.Equal("Lawyer verified successfully", message);

        // Optional: verify the mediator was called once
        _mediatorMock.Verify(m => m.Send(It.Is<AcceptLawyerVerificationCommand>(
            cmd => cmd.UserId == userId && cmd.AdminUserId == "admin123"), default), Times.Once);
    }
    
    [Fact]
    public async Task Reject_ReturnsOkAndSendsCommand()
    {
        // Arrange
        string userId = "lawyer1";
        string reason = "Incomplete documents";

        _mediatorMock.Setup(m => m.Send(It.IsAny<RejectLawyerVerificationCommand>(), default))
            .ReturnsAsync("Lawyer rejected successfully"); 

        // Act
        var result = await _controller.Reject(userId, reason);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var message = Assert.IsType<string>(okResult.Value);
        Assert.Equal("Lawyer rejected successfully", message);

        // Verify mediator was called with correct command
        _mediatorMock.Verify(m => m.Send(It.Is<RejectLawyerVerificationCommand>(
            cmd => cmd.UserId == userId &&
                   cmd.RejectedReason == reason &&
                   cmd.AdminUserId == "admin123"), default), Times.Once);
    }
}