using Microsoft.Extensions.Configuration;
using FluentAssertions;
using LawMate.API.Controllers.Common;
using LawMate.API.Model.Chatbot;
using LawMate.API.Services.Chatbot;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace LawMate.Tests.Controllers.Common;

public class ChatbotControllerTests
{
    private readonly OpenAiChatbotService _service;
    private readonly ChatbotController _controller;

    public ChatbotControllerTests()
    {
        var configMock = new Mock<IConfiguration>();
        configMock.Setup(c => c["OpenAI:ApiKey"]).Returns("test-key");

        _service = new OpenAiChatbotService(configMock.Object);

        _controller = new ChatbotController(_service);
    }

    // Request NULL
    [Fact]
    public async Task ClassifyIssue_Should_Return_BadRequest_When_Request_Is_Null()
    {
        // Act
        var result = await _controller.ClassifyIssue(null);

        // Assert
        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequest.StatusCode.Should().Be(400);
    }

    // IssueText Empty
    [Fact]
    public async Task ClassifyIssue_Should_Return_BadRequest_When_IssueText_Empty()
    {
        // Arrange
        var request = new ChatbotClassificationRequest
        {
            IssueText = ""
        };

        // Act
        var result = await _controller.ClassifyIssue(request);

        // Assert
        var badRequest = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        badRequest.StatusCode.Should().Be(400);
    }

    // Valid request
    // [Fact]
    // public async Task ClassifyIssue_Should_Return_Ok_When_Request_Valid()
    // {
    //     // Arrange
    //     var request = new ChatbotClassificationRequest
    //     {
    //         IssueText = "My landlord refuses to return my deposit"
    //     };
    //
    //     var serviceResponse = new ChatbotClassificationResponse
    //     {
    //         SuggestedLawyerCategory = "Tenant Rights",
    //         ShortReason = "Landlord refusing to return deposit",
    //         Disclaimer = "This is not legal advice"
    //     };
    //
    //     _service
    //         .Setup(s => s.ClassifyIssueAsync(It.IsAny<string>()))
    //         .ReturnsAsync(serviceResponse);
    //
    //     // Act
    //     var result = await _controller.ClassifyIssue(request);
    //
    //     // Assert
    //     var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
    //     okResult.StatusCode.Should().Be(200);
    //     okResult.Value.Should().BeEquivalentTo(serviceResponse);
    // }
}