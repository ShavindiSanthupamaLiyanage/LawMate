using LawMate.API.Controllers.LawyerModule;
using LawMate.Application.LawyerModule.LawyerSearch.Queries;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.LawyerModule
{
    public class ClientLawyerSearchControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly ClientLawyerSearchController _controller;

        public ClientLawyerSearchControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new ClientLawyerSearchController(_mediatorMock.Object);
        }

        [Fact]
        public async Task GetDropdowns_Should_Return_Ok_With_Data()
        {
            // Arrange
            var expected = new LawyerSearchDropdownsDto
            {
                AreasOfPractice = new(),
                Districts = new(),
                LawyerNames = new()
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetLawyerSearchDropdownsQuery>(), default))
                .ReturnsAsync(expected);

            // Act
            var result = await _controller.GetDropdowns();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expected, okResult.Value);
        }

        [Fact]
        public async Task SearchLawyers_Should_Return_All_When_No_Params()
        {
            // Arrange
            var expected = new List<LawyerSearchResultDto>
            {
                new LawyerSearchResultDto { LawyerId = "L1", FullName = "John Doe" }
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<SearchLawyerQuery>(), default))
                .ReturnsAsync(expected);

            // Act
            var result = await _controller.SearchLawyers(null, null, null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var data = Assert.IsType<List<LawyerSearchResultDto>>(okResult.Value);

            Assert.Single(data);
            Assert.Equal("L1", data[0].LawyerId);
        }

        [Fact]
        public async Task SearchLawyers_Should_Pass_Correct_Params_To_Mediator()
        {
            // Arrange
            SearchLawyerQuery capturedQuery = null;

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<SearchLawyerQuery>(), default))
                .Callback<IRequest<List<LawyerSearchResultDto>>, CancellationToken>((req, _) =>
                {
                    capturedQuery = (SearchLawyerQuery)req;
                })
                .ReturnsAsync(new List<LawyerSearchResultDto>());

            // Act
            await _controller.SearchLawyers(
                AreaOfPractice.Criminal,
                District.Colombo,
                "john"
            );

            // Assert
            Assert.NotNull(capturedQuery);
            Assert.Equal(AreaOfPractice.Criminal, capturedQuery.AreaOfPractice);
            Assert.Equal(District.Colombo, capturedQuery.District);
            Assert.Equal("john", capturedQuery.NameSearch);
        }

        [Fact]
        public async Task SearchLawyers_Should_Return_Empty_List()
        {
            // Arrange
            _mediatorMock
                .Setup(m => m.Send(It.IsAny<SearchLawyerQuery>(), default))
                .ReturnsAsync(new List<LawyerSearchResultDto>());

            // Act
            var result = await _controller.SearchLawyers(null, null, null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var data = Assert.IsType<List<LawyerSearchResultDto>>(okResult.Value);

            Assert.Empty(data);
        }
    }
}