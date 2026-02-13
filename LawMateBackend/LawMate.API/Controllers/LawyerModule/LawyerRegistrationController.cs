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

        //[Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new GetAllLawyersQuery());
            return Ok(result);
        }

        //[Authorize]
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetByUserId(string userId)
        {
            var result = await _mediator.Send(new GetLawyerByUserIdQuery(userId));
            return Ok(result);
        }

        // [HttpPost]
        // public async Task<IActionResult> Register([FromBody] CreateLawyerCommand command)
        // {
        //     var result = await _mediator.Send(command);
        //     return Ok(result);
        // }
        
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Register([FromForm] LawyerRegistrationModal request)
        {
            byte[]? profileImage = null;
            byte[]? enrollmentCert = null;
            byte[]? nicFront = null;
            byte[]? nicBack = null;
        
            if (request.ProfileImage != null)
            {
                using var ms = new MemoryStream();
                await request.ProfileImage.CopyToAsync(ms);
                profileImage = ms.ToArray();
            }
        
            if (request.EnrollmentCertificate != null)
            {
                using var ms = new MemoryStream();
                await request.EnrollmentCertificate.CopyToAsync(ms);
                enrollmentCert = ms.ToArray();
            }
        
            if (request.NICFrontImage != null)
            {
                using var ms = new MemoryStream();
                await request.NICFrontImage.CopyToAsync(ms);
                nicFront = ms.ToArray();
            }
        
            if (request.NICBackImage != null)
            {
                using var ms = new MemoryStream();
                await request.NICBackImage.CopyToAsync(ms);
                nicBack = ms.ToArray();
            }
        
            var command = new CreateLawyerCommand
            {
                Data = new CreateLawyerDto
                {
                    Prefix = request.Prefix,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    UserId = request.UserId,
                    Email = request.Email,
                    NIC = request.NIC,
                    Password = request.Password,
                    ContactNumber = request.ContactNumber,
                    Bio = request.Bio,
                    YearOfExperience = request.YearOfExperience,
                    WorkingDistrict = request.WorkingDistrict,
                    AreaOfPractice = request.AreaOfPractice,
                    BarAssociationMembership = request.BarAssociationMembership,
                    BarAssociationRegNo = request.BarAssociationRegNo,
                    SCECertificateNo = request.SCECertificateNo,
                    OfficeContactNumber = request.OfficeContactNumber,
        
                    ProfileImage = profileImage,
                    EnrollmentCertificate = enrollmentCert,
                    NICFrontImage = nicFront,
                    NICBackImage = nicBack
                }
            };
        
            var result = await _mediator.Send(command);
            return Ok(result);
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

        //[HttpPut("{userId}")]
        //public async Task<IActionResult> Update(string userId, [FromBody] UpdateLawyerCommand command)
        //{
        //    if (command.Data.UserId != userId)
        //        return BadRequest("UserId mismatch");

        //    var result = await _mediator.Send(command);
        //    return Ok(result);
        //}
        
        // [Authorize]
        [HttpPut("{userId}/profile-image")]
        public async Task<IActionResult> ChangeProfileImage(
            string userId,
            [FromBody] ChangeLawyerProfileImageCommand command)
        {
            if (command.UserId != userId)
                return BadRequest("UserId mismatch");

            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}
