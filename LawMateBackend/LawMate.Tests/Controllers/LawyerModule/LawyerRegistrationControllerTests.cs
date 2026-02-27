using FluentAssertions;
using LawMate.API.Controllers.LawyerModule;
using LawMate.Application.LawyerModule.LawyerRegistration.Command;
using LawMate.Application.LawyerModule.LawyerRegistration.Queries;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.LawyerModule;

public class LawyerRegistrationControllerTests
{
    private readonly Mock<IMediator> _mediatorMock;
    private readonly LawyerRegistrationController _controller;

    public LawyerRegistrationControllerTests()
    {
        _mediatorMock = new Mock<IMediator>();
        _controller = new LawyerRegistrationController(_mediatorMock.Object);
    }

    // GET ALL
    [Fact]
    public async Task GetAll_Should_Return_Ok_With_Data()
    {
        // Arrange
        var lawyers = new List<GetLawyerDto>
        {
            new GetLawyerDto
            {
                UserId = "U1",
                FirstName = "John"
            }
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetAllLawyersQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(lawyers);

        // Act
        var result = await _controller.GetAll();

        // Assert
        var okResult = result as OkObjectResult;
        okResult.Should().NotBeNull();
        okResult!.StatusCode.Should().Be(200);
    }
    
    // GET BY USER ID
    [Fact]
    public async Task GetByUserId_Should_Return_Ok_With_Data()
    {
        var lawyer = new GetLawyerDto
        {
            UserId = "U1",
            FirstName = "John"
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<GetLawyerByUserIdQuery>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(lawyer);

        var result = await _controller.GetByUserId("U1");

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);
        okResult.Value.Should().BeEquivalentTo(lawyer);
    }
    
    // REGISTER SUCCESS
    [Fact]
    public async Task Register_Should_Return_Ok_When_Successful()
    {
        // Arrange
        var dto = new CreateLawyerDto();

        var user = new USER_DETAIL
        {
            UserId = "U1"
        };

        var lawyer = new LAWYER_DETAILS
        {
            UserId = "U1"
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<CreateLawyerCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((user, lawyer));

        // Act
        var result = await _controller.Register(dto);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);

        // Assert returned anonymous object safely
        okResult.Value.Should().BeEquivalentTo(new
        {
            Message = "Lawyer created successfully",
            LawyerId = "U1"
        });
    }
    
    // REGISTER FAILURE
    [Fact]
    public async Task Register_Should_Return_BadRequest_When_Exception_Thrown()
    {
        var dto = new CreateLawyerDto();

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<CreateLawyerCommand>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Something went wrong"));

        var result = await _controller.Register(dto);

        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequest.StatusCode.Should().Be(400);
    }
    
    // DELETE
    [Fact]
    public async Task Delete_Should_Return_NoContent()
    {
        _mediatorMock
            .Setup(m => m.Send(It.IsAny<DeleteLawyerCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var result = await _controller.Delete("U1");

        result.Should().BeOfType<NoContentResult>();
    }
    
    // UPDATE SUCCESS
    [Fact]
    public async Task Update_Should_Return_Ok_When_Successful()
    {
        // Arrange
        var command = new UpdateLawyerCommand { UserId = "U1" };
        var user = new USER_DETAIL { UserId = "U1" };
        var lawyer = new LAWYER_DETAILS { UserId = "U1" };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<UpdateLawyerCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((user, lawyer)); // tuple

        // Act
        var result = await _controller.Update("U1", command);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);

        // Deconstruct tuple
        var (userResult, lawyerResult) = ((USER_DETAIL User, LAWYER_DETAILS Lawyer))okResult.Value;

        lawyerResult.UserId.Should().Be("U1");
        userResult.UserId.Should().Be("U1");
    }
    
    // UPDATE MISMATCH
    [Fact]
    public async Task Update_Should_Return_BadRequest_When_UserId_Mismatch()
    {
        var command = new UpdateLawyerCommand
        {
            UserId = "U2"
        };

        var result = await _controller.Update("U1", command);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    // CHANGE PROFILE IMAGE SUCCESS
    [Fact]
    public async Task ChangeProfileImage_Should_Return_Ok_When_Successful()
    {
        // Arrange
        var command = new ChangeLawyerProfileImageCommand
        {
            UserId = "U1"
        };

        var user = new USER_DETAIL
        {
            UserId = "U1"
        };

        _mediatorMock
            .Setup(m => m.Send(It.IsAny<ChangeLawyerProfileImageCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _controller.ChangeProfileImage("U1", command);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.StatusCode.Should().Be(200);

        // Assert the returned user
        var returnedUser = okResult.Value as USER_DETAIL;
        returnedUser.UserId.Should().Be("U1");
    }
    
    // CHANGE PROFILE IMAGE MISMATCH
    [Fact]
    public async Task ChangeProfileImage_Should_Return_BadRequest_When_UserId_Mismatch()
    {
        var command = new ChangeLawyerProfileImageCommand
        {
            UserId = "U2"
        };

        var result = await _controller.ChangeProfileImage("U1", command);

        result.Should().BeOfType<BadRequestObjectResult>();
    }
}