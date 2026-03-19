using LawMate.Application.LawyerModule.LawyerSearch.Queries;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.LawyerModule;

[ApiController]
[Route("api/client/lawyers")]
[Authorize(Roles = "Client")]
public class ClientLawyerSearchController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClientLawyerSearchController(IMediator mediator)
        => _mediator = mediator;

    /// <summary>
    /// Load Case Area and District dropdowns on screen open.
    /// GET /api/client/lawyers/dropdowns
    /// </summary>
    [HttpGet("dropdowns")]
    public async Task<IActionResult> GetDropdowns()
    {
        var result = await _mediator.Send(new GetLawyerSearchDropdownsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Search by any combination of filters.
    /// All params are optional — if none provided, returns all verified lawyers.
    /// GET /api/client/lawyers/search
    /// GET /api/client/lawyers/search?areaOfPractice=1
    /// GET /api/client/lawyers/search?district=0&areaOfPractice=2
    /// GET /api/client/lawyers/search?nameSearch=silva
    /// GET /api/client/lawyers/search?nameSearch=john&district=0
    /// </summary>
    [HttpGet("search")]
    public async Task<IActionResult> SearchLawyers(
        [FromQuery] AreaOfPractice? areaOfPractice,
        [FromQuery] District?       district,
        [FromQuery] string?         nameSearch)
    {
        var result = await _mediator.Send(new SearchLawyerQuery
        {
            AreaOfPractice = areaOfPractice,
            District       = district,
            NameSearch     = nameSearch,
        });

        return Ok(result);
    }
}