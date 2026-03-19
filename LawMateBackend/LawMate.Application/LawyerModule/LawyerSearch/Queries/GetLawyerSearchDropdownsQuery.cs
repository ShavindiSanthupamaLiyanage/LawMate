
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerSearch.Queries;

public record GetLawyerSearchDropdownsQuery : IRequest<LawyerSearchDropdownsDto>;

public class LawyerSearchDropdownsDto
{
    public List<DropdownItem>       AreasOfPractice { get; set; } = [];
    public List<DropdownItem>       Districts       { get; set; } = [];
    public List<LawyerDropdownItem> LawyerNames     { get; set; } = [];
}

public class DropdownItem
{
    public int    Value { get; set; }
    public string Label { get; set; } = string.Empty;
}

public class LawyerDropdownItem
{
    public string Value { get; set; } = string.Empty; // UserId
    public string Label { get; set; } = string.Empty; // Full name
}

public class GetLawyerSearchDropdownsQueryHandler
    : IRequestHandler<GetLawyerSearchDropdownsQuery, LawyerSearchDropdownsDto>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerSearchDropdownsQueryHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<LawyerSearchDropdownsDto> Handle(
        GetLawyerSearchDropdownsQuery request,
        CancellationToken cancellationToken)
    {
        // Only show verified + active lawyers in the name dropdown
        var lawyerNames = await (
            from lawyer in _context.LAWYER_DETAILS
            join user in _context.USER_DETAIL
                on lawyer.UserId equals user.UserId
            where lawyer.VerificationStatus == VerificationStatus.Verified
               && user.State                == State.Active
               && user.UserRole             == UserRole.Lawyer
            orderby user.FirstName
            select new LawyerDropdownItem
            {
                Value = lawyer.UserId,
                Label = user.FirstName + " " + user.LastName
            }
        ).ToListAsync(cancellationToken);

        var areas = Enum.GetValues<AreaOfPractice>()
            .Select(a => new DropdownItem { Value = (int)a, Label = a.ToString() })
            .ToList();

        var districts = Enum.GetValues<District>()
            .Select(d => new DropdownItem { Value = (int)d, Label = d.ToString() })
            .ToList();

        return new LawyerSearchDropdownsDto
        {
            AreasOfPractice = areas,
            Districts       = districts,
            LawyerNames     = lawyerNames,
        };
    }
}