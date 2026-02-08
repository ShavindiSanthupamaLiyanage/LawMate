using LawMate.Application.LawyerModule.LawyerRegistration.Command;
using LawMate.Application.LawyerModule.LawyerRegistration.Queries;
using MediatR;
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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllLawyersQuery());
            return Ok(result);
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetByUserId(string userId)
        {
            var result = await _mediator.Send(new GetLawyerByUserIdQuery(userId));
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] CreateLawyerCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        [HttpDelete("{userId}")]
        public async Task<IActionResult> Delete(string userId)
        {
            await _mediator.Send(new DeleteLawyerCommand(userId));
            return NoContent();
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateLawyerCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        //[HttpPut("{userId}")]
        //public async Task<IActionResult> Update(string userId, [FromBody] UpdateLawyerCommand command)
        //{
        //    if (command.Data.UserId != userId)
        //        return BadRequest("UserId mismatch");

        //    var result = await _mediator.Send(command);
        //    return Ok(result);
        //}

    }
}
