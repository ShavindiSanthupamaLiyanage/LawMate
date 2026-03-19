using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerSearch.Queries;

// ---------- Request ----------
public class SearchLawyerQuery : IRequest<List<LawyerSearchResultDto>>
{
    public AreaOfPractice? AreaOfPractice { get; set; }
    public District?       District       { get; set; }
    public string?         NameSearch     { get; set; } // free-text name search
}

// ---------- Result DTO ----------
public class LawyerSearchResultDto
{
    public string  LawyerId                { get; set; } = string.Empty;
    public string  FullName                { get; set; } = string.Empty;
    public string? ProfileImageBase64      { get; set; }
    public string  AreaOfPractice          { get; set; } = string.Empty;
    public string  WorkingDistrict         { get; set; } = string.Empty;
    public string? ProfessionalDesignation { get; set; }
    public int     YearOfExperience        { get; set; }
    public decimal AverageRating           { get; set; }
    public string? Bio                     { get; set; }
    public string? OfficeContactNumber     { get; set; }
}

// ---------- Handler ----------
public class SearchLawyerQueryHandler
    : IRequestHandler<SearchLawyerQuery, List<LawyerSearchResultDto>>
{
    private readonly IApplicationDbContext _context;

    public SearchLawyerQueryHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<List<LawyerSearchResultDto>> Handle(
        SearchLawyerQuery request,
        CancellationToken cancellationToken)
    {
        var query =
            from lawyer in _context.LAWYER_DETAILS
            join user in _context.USER_DETAIL
                on lawyer.UserId equals user.UserId
            where lawyer.VerificationStatus == VerificationStatus.Verified
               && user.State                == State.Active
               && user.UserRole             == UserRole.Lawyer
            select new { lawyer, user };

        // All filters are independent — any combination works
        if (request.AreaOfPractice.HasValue)
            query = query.Where(x => x.lawyer.AreaOfPractice == request.AreaOfPractice.Value);

        if (request.District.HasValue)
            query = query.Where(x => x.lawyer.WorkingDistrict == request.District.Value);

        if (!string.IsNullOrWhiteSpace(request.NameSearch))
        {
            var search = request.NameSearch.Trim().ToLower();
            query = query.Where(x =>
                (x.user.FirstName + " " + x.user.LastName).ToLower().Contains(search) ||
                x.user.FirstName!.ToLower().Contains(search) ||
                x.user.LastName!.ToLower().Contains(search));
        }

        var results = await query
            .OrderByDescending(x => x.lawyer.AverageRating)
            .ThenByDescending(x => x.lawyer.YearOfExperience)
            .Select(x => new LawyerSearchResultDto
            {
                LawyerId                = x.lawyer.UserId,
                FullName                = x.user.FirstName + " " + x.user.LastName,
                ProfileImageBase64      = x.user.ProfileImage != null
                                            ? Convert.ToBase64String(x.user.ProfileImage)
                                            : null,
                AreaOfPractice          = x.lawyer.AreaOfPractice.ToString(),
                WorkingDistrict         = x.lawyer.WorkingDistrict.ToString(),
                ProfessionalDesignation = x.lawyer.ProfessionalDesignation,
                YearOfExperience        = x.lawyer.YearOfExperience,
                AverageRating           = x.lawyer.AverageRating,
                Bio                     = x.lawyer.Bio,
                OfficeContactNumber     = x.lawyer.OfficeContactNumber,
            })
            .ToListAsync(cancellationToken);

        return results;
    }
}