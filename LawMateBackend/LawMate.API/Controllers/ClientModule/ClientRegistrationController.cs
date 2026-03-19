using LawMate.Application.ClientModule.ClientRegistration.Commands;
using LawMate.Application.ClientModule.ClientRegistration.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.ClientModule
{
    [ApiController]
    [Route("api/clients")]
    public class ClientRegistrationController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ClientRegistrationController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET: api/clients (Get all clients)
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllClientsQuery());
            return Ok(result);
        }

        // GET: api/clients/{userId} (Get client by userId)
        [Authorize]
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetByUserId(string userId)
        {
            var result = await _mediator.Send(new GetClientByUserIdQuery(userId));
            return Ok(result);
        }

        // POST: api/clients (Register client)
        [AllowAnonymous]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] CreateClientDto request)
        {
            try
            {
                var userId = await _mediator.Send(new CreateClientCommand
                {
                    Data = request
                });

                return Ok(new
                {
                    Message = "Client created successfully",
                    ClientId = userId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = "Failed to create client",
                    Error = ex.Message
                });
            }
        }

        // PUT: api/clients/{userId} (Update client)
        [Authorize]
        [HttpPut("{userId}")]
        public async Task<IActionResult> Update(string userId, [FromBody] UpdateClientCommand command)
        {
            if (userId != command.UserId)
                return BadRequest("UserId mismatch");

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        // ✅ PUT: api/clients/{userId}/profile-image (Upload/change profile image)
        [Authorize]
        [HttpPut("{userId}/profile-image")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ChangeProfileImage(
            string userId,
            [FromForm] ChangeClientProfileImageCommand command)
        {
            if (userId != command.UserId)
                return BadRequest("UserId mismatch");

            var result = await _mediator.Send(command);
            return Ok(result);
        }

        // DELETE: api/clients/{userId} (Soft delete / deactivate client)
        [Authorize]
        [HttpDelete("{userId}")]
        public async Task<IActionResult> Delete(string userId)
        {
            await _mediator.Send(new DeleteClientCommand(userId));
            return NoContent();
        }
        
        [Authorize]
        [HttpPut("suspend/{userId}")]
        public async Task<IActionResult> SuspendClient(
            string userId,
            [FromBody] SuspendClientCommand command)
        {
            if (userId != command.UserId)
                return BadRequest("UserId mismatch");

            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}