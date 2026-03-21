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

        [Authorize]
        [HttpDelete("{userId}")]
        public async Task<IActionResult> Delete(string userId)
        {
            await _mediator.Send(new DeleteLawyerCommand(userId));
            return NoContent();
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateLawyerCommand command)
        {
            if (id != command.UserId)
                return BadRequest("Mismatched UserId");

            var result = await _mediator.Send(command);
            return Ok(result);
        }
        
        [Authorize]
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
        
        [Authorize]
        [HttpPost("{lawyerId}/membership-payment")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadMembershipPayment(
            string lawyerId,
            [FromForm] UploadMembershipPaymentCommand command)
        {
            if (lawyerId != command.LawyerId)
                return BadRequest("LawyerId mismatch");

            var transactionId = await _mediator.Send(command);

            return Ok(new
            {
                Message = "Membership payment uploaded successfully",
                TransactionId = transactionId
            });
        }
        
        [Authorize]
        [HttpGet("{userId}/profile")]
        public async Task<IActionResult> GetLawyerProfile(string userId)
        {
            try
            {
                var lawyer = await _mediator.Send(new GetLawyerByUserIdQuery(userId));

                var profile = new LawyerProfileDto
                {
                    LawyerId                = lawyer.UserId,
                    FullName                = $"{lawyer.FirstName} {lawyer.LastName}".Trim(),
                    ProfileImageBase64      = lawyer.ProfileImage != null
                        ? Convert.ToBase64String(lawyer.ProfileImage)
                        : null,
                    AreaOfPractice          = lawyer.AreaOfPractice.ToString(),
                    ProfessionalDesignation = lawyer.ProfessionalDesignation,
                    YearOfExperience = lawyer.YearOfExperience ?? 0,
                    AverageRating           = (double)lawyer.AverageRating,
                };

                return Ok(profile);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = "Failed to retrieve lawyer profile", Error = ex.Message });
            }
        }
    }
}
