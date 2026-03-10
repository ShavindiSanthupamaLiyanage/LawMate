using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminReports.Queries;

public class GetClientDetailReportQuery : IRequest<IEnumerable<ClientDetailReportDto>>;

public class GetClientDetailReportQueryHandler
    : IRequestHandler<GetClientDetailReportQuery, IEnumerable<ClientDetailReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetClientDetailReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ClientDetailReportDto>> Handle(
        GetClientDetailReportQuery request,
        CancellationToken cancellationToken)
    {
        var result = await (
                from ud in _context.USER_DETAIL
                join cd in _context.CLIENT_DETAILS on ud.UserId equals cd.UserId
                where ud.UserRole == UserRole.Client

                select new
                {
                    ud.UserId,
                    ud.Prefix,
                    ud.FirstName,
                    ud.LastName,
                    ud.Email,
                    ud.ContactNumber,
                    ud.Gender,
                    ud.NIC,
                    ud.RegistrationDate,
                    ud.LastLoginDate,
                    ud.State,

                    cd.Address,
                    cd.District,
                    cd.PrefferedLanguage
                })
            .ToListAsync(cancellationToken);

        var mapped = result.Select(r => new ClientDetailReportDto
            {
                UserId = r.UserId,
                Prefix = r.Prefix.ToString(),
                FirstName = r.FirstName,
                LastName = r.LastName,
                Email = r.Email,
                ContactNumber = r.ContactNumber,
                Gender = r.Gender.ToString(),
                NIC = r.NIC,
                RegistrationDate = r.RegistrationDate,
                LastLoginDate = r.LastLoginDate,
                State = r.State.ToString(),

                Address = r.Address,
                District = r.District.ToString(),
                PreferredLanguage = r.PrefferedLanguage.ToString()
            })
            .OrderByDescending(r => r.RegistrationDate)
            .ToList();

        return mapped;
    }
}