using FluentAssertions;
using LawMate.API.Controllers.LawyerModule;
using LawMate.Application.LawyerModule.LawyerRegistration.Queries;
using LawMate.Domain.DTOs;
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
}