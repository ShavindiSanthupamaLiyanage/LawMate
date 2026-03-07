using LawMate.Application.ClientModule.ContactUs.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.ClientModule;

[ApiController]
[Route("api/contactUs")]
[Authorize]
public class ContactUsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ContactUsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendContactMessage(
        [FromBody] SendContactUsMessageCommand command)
    {
        var result = await _mediator.Send(command);

        return Ok(new
        {
            message = "Your message has been sent successfully."
        });
    }
}