// using FluentAssertions;
// using LawMate.API.Controllers.Common;
// using LawMate.Application.AdminModule.UserManagement.Queries;
// using LawMate.Application.Common.UserDetails.Queries;
// using MediatR;
// using Microsoft.AspNetCore.Mvc;
// using Moq;
//
// namespace LawMate.Tests.Controllers.AdminModule
// {
//     public class UserControllerTests
//     {
//         private readonly Mock<IMediator> _mediatorMock;
//         private readonly UserController _controller;
//
//         public UserControllerTests()
//         {
//             _mediatorMock = new Mock<IMediator>();
//             _controller = new UserController(_mediatorMock.Object);
//         }
//
//         [Fact]
//         public async Task GetAll_Should_Return_Ok()
//         {
//             var expected = new List<object>();
//
//             _mediatorMock
//                 .Setup(m => m.Send(It.IsAny<GetAllUsersQuery>(), It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(expected);
//
//             var result = await _controller.GetAll();
//
//             var okResult = result as OkObjectResult;
//
//             okResult.Should().NotBeNull();
//             okResult!.Value.Should().Be(expected);
//         }
//
//         [Fact]
//         public async Task GetActive_Should_Return_Ok()
//         {
//             var expected = new List<object>();
//
//             _mediatorMock
//                 .Setup(m => m.Send(It.IsAny<GetActiveUsersQuery>(), It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(expected);
//
//             var result = await _controller.GetActive();
//
//             var okResult = result as OkObjectResult;
//
//             okResult.Should().NotBeNull();
//             okResult!.Value.Should().Be(expected);
//         }
//
//         [Fact]
//         public async Task GetInactive_Should_Return_Ok()
//         {
//             var expected = new List<object>();
//
//             _mediatorMock
//                 .Setup(m => m.Send(It.IsAny<GetInactiveUsersQuery>(), It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(expected);
//
//             var result = await _controller.GetInactive();
//
//             var okResult = result as OkObjectResult;
//
//             okResult.Should().NotBeNull();
//         }
//
//         [Fact]
//         public async Task GetPending_Should_Return_Ok()
//         {
//             var expected = new List<object>();
//
//             _mediatorMock
//                 .Setup(m => m.Send(It.IsAny<GetPendingUsersQuery>(), It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(expected);
//
//             var result = await _controller.GetPending();
//
//             var okResult = result as OkObjectResult;
//
//             okResult.Should().NotBeNull();
//         }
//
//         [Fact]
//         public async Task GetById_Should_Return_Ok()
//         {
//             var expected = new object();
//
//             _mediatorMock
//                 .Setup(m => m.Send(It.IsAny<GetUserByIdQuery>(), It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(expected);
//
//             var result = await _controller.GetById("U1");
//
//             var okResult = result as OkObjectResult;
//
//             okResult.Should().NotBeNull();
//         }
//
//         [Fact]
//         public async Task GetByNic_Should_Return_Ok()
//         {
//             var expected = new object();
//
//             _mediatorMock
//                 .Setup(m => m.Send(It.IsAny<GetUserByNicQuery>(), It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(expected);
//
//             var result = await _controller.GetByNic("123456789V");
//
//             var okResult = result as OkObjectResult;
//
//             okResult.Should().NotBeNull();
//         }
//
//         [Fact]
//         public async Task GetUserRole_Should_Return_Ok()
//         {
//             var expected = "Admin";
//
//             _mediatorMock
//                 .Setup(m => m.Send(It.IsAny<GetUserRoleQuery>(), It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(expected);
//
//             var result = await _controller.GetUserRole("U1");
//
//             var okResult = result as OkObjectResult;
//
//             okResult.Should().NotBeNull();
//             okResult!.Value.Should().Be(expected);
//         }
//
//         [Fact]
//         public async Task GetUserCounts_Should_Return_Ok()
//         {
//             var expected = new { Total = 10, Active = 7 };
//
//             _mediatorMock
//                 .Setup(m => m.Send(It.IsAny<GetUserCountsQuery>(), It.IsAny<CancellationToken>()))
//                 .ReturnsAsync(expected);
//
//             var result = await _controller.GetUserCounts();
//
//             var okResult = result as OkObjectResult;
//
//             okResult.Should().NotBeNull();
//         }
//     }
// }



using FluentAssertions;
using LawMate.API.Controllers.Common;
using LawMate.Application.AdminModule.UserManagement.Queries;
using LawMate.Application.Common.UserDetails.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace LawMate.Tests.API.Controllers.Common
{
    public class UserControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly UserController _controller;

        public UserControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new UserController(_mediatorMock.Object);
        }

        [Fact]
        public async Task GetAll_Should_Return_ListOfUserDetailResponseDto()
        {
            var expected = new List<UserDetailResponseDto>
            {
                new() { UserId = "U1", Email = "user1@test.com" }
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetAllUsersQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected); // Must match the actual return type

            var result = await _controller.GetAll();
            var okResult = result as OkObjectResult;

            okResult.Should().NotBeNull();
            okResult!.Value.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetUserRole_Should_Return_UserRoleDto()
        {
            var expected = new UserRoleDto { UserId = "U1", Role = "Admin" };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetUserRoleQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected); // Must match return type

            var result = await _controller.GetUserRole("U1");
            var okResult = result as OkObjectResult;

            okResult.Should().NotBeNull();
            okResult!.Value.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetUserCounts_Should_Return_UserCountsDto()
        {
            var expected = new UserCountsDto { VerifiedLawyers = 10, ActiveLawyers = 7 };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetUserCountsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            var result = await _controller.GetUserCounts();
            var okResult = result as OkObjectResult;

            okResult.Should().NotBeNull();
            okResult!.Value.Should().BeEquivalentTo(expected);
        }
        
        [Fact]
        public async Task GetActive_Should_Return_ListOfUserDetailResponseDto()
        {
            var expected = new List<UserDetailResponseDto>
            {
                new() { UserId = "U2", Email = "activeuser@test.com" }
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetActiveUsersQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            var result = await _controller.GetActive();
            var okResult = result as OkObjectResult;

            okResult.Should().NotBeNull();
            okResult!.Value.Should().BeEquivalentTo(expected);
        }
        
        [Fact]
        public async Task GetInactive_Should_Return_ListOfUserDetailResponseDto()
        {
            var expected = new List<UserDetailResponseDto>
            {
                new() { UserId = "U3", Email = "inactiveuser@test.com" }
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetInactiveUsersQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            var result = await _controller.GetInactive();
            var okResult = result as OkObjectResult;

            okResult.Should().NotBeNull();
            okResult!.Value.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetPending_Should_Return_ListOfUserDetailResponseDto()
        {
            var expected = new List<UserDetailResponseDto>
            {
                new() { UserId = "U4", Email = "pendinguser@test.com" }
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetPendingUsersQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            var result = await _controller.GetPending();
            var okResult = result as OkObjectResult;

            okResult.Should().NotBeNull();
            okResult!.Value.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetById_Should_Return_UserDetailResponseDto()
        {
            var expected = new UserDetailResponseDto
            {
                UserId = "U5",
                Email = "userbyid@test.com"
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetUserByIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            var result = await _controller.GetById("U5");
            var okResult = result as OkObjectResult;

            okResult.Should().NotBeNull();
            okResult!.Value.Should().BeEquivalentTo(expected);
        }

        [Fact]
        public async Task GetByNic_Should_Return_UserDetailResponseDto()
        {
            var expected = new UserDetailResponseDto
            {
                UserId = "U6",
                Email = "userbynic@test.com"
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetUserByNicQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(expected);

            var result = await _controller.GetByNic("123456789V");
            var okResult = result as OkObjectResult;

            okResult.Should().NotBeNull();
            okResult!.Value.Should().BeEquivalentTo(expected);
        }
    }
    
}