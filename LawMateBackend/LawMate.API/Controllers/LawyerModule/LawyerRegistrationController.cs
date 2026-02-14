using LawMate.API.Model.Lawyer;
using LawMate.Application.LawyerModule.LawyerRegistration.Command;
using LawMate.Application.LawyerModule.LawyerRegistration.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.LawyerModule
{
    [ApiController]
    [Route("api/lawyers")]
    public class LawyerRegistrationController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LawyerRegistrationController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllLawyersQuery());
            return Ok(result);
        }

        [Authorize]
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetByUserId(string userId)
        {
            var result = await _mediator.Send(new GetLawyerByUserIdQuery(userId));
            return Ok(result);
        }
        
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] CreateLawyerDto request)
        {
            try
            {
                var (user, lawyer) = await _mediator.Send(new CreateLawyerCommand
                {
                    Data = request
                });

                return Ok(new
                {
                    Message = "Lawyer created successfully",
                    LawyerId = lawyer.UserId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Message = "Failed to create lawyer",
                    Error = ex.Message
                });
            }
        }

        //[Authorize]
        [HttpDelete("{userId}")]
        public async Task<IActionResult> Delete(string userId)
        {
            await _mediator.Send(new DeleteLawyerCommand(userId));
            return NoContent();
        }

        // [Authorize]
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateLawyerCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        
        // [Authorize]
        [HttpPut("{userId}/profile-image")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ChangeProfileImage(
            string userId,
            [FromForm] ChangeLawyerProfileImageCommand command)
        {
            if (command.UserId != userId)
                return BadRequest("UserId mismatch");

            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
