using LawMate.API.Model.Admin;
using LawMate.Application.AdminModule.AdminRegistration.Commands;
using LawMate.Application.AdminModule.AdminRegistration.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.AdminModule
{
    [ApiController]
    [Route("api/admin-registration")]
    public class AdminRegistrationController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IAppLogger _logger;

        public AdminRegistrationController(IMediator mediator, IAppLogger logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("create-admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateAdmin(
            [FromForm] CreateAdminRequest request)
        {
            try
            {
                byte[]? imageBytes = null;

                if (request.ProfileImage != null)
                {
                    using var ms = new MemoryStream();
                    await request.ProfileImage.CopyToAsync(ms);
                    imageBytes = ms.ToArray();
                }

                var command = new CreateAdminCommand
                {
                    Data = new CreateAdminDto
                    {
                        FirstName = request.FirstName,
                        LastName = request.LastName,
                        Email = request.Email,
                        NIC = request.NIC,
                        Password = request.Password,
                        PhoneNumber = request.PhoneNumber,
                        RecordStatus = request.RecordStatus,
                        State = request.State,
                        ProfileImage = imageBytes
                    }
                };

                var result = await _mediator.Send(command);

                _logger.Info($"Admin created successfully | Username: {request.NIC}");
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.Error("Error occurred while creating admin", ex);
                throw;
            }
        }

        [Authorize]
        [HttpGet("get-all-admin")]
        public async Task<IActionResult> GetAllAdmins()
        {
            _logger.Info("GetAllAdmins API called");

            var result = await _mediator.Send(new GetAllAdminsQuery());

            _logger.Info($"GetAllAdmins completed | Count: {result.Count}");
            return Ok(result);
        }

        [Authorize]
        [HttpGet("get-admin-by-userId")]
        public async Task<IActionResult> GetAdminByUserId(string userId)
        {
            _logger.Info($"GetAdminByUserId API called | UserId: {userId}");

            var result = await _mediator.Send(new GetAdminByUserIdQuery
            {
                UserId = userId
            });

            if (result == null)
            {
                _logger.Warning($"Admin not found | UserId: {userId}");
                return NotFound("Admin not found");
            }

            _logger.Info($"Admin found | UserId: {userId}");
            return Ok(result);
        }
    }
}
