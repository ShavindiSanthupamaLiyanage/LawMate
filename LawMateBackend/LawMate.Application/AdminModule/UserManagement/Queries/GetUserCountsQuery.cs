using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.UserManagement.Queries;

public class GetUserCountsQuery : IRequest<UserCountsDto>
{
}

public class GetUserCountsQueryHandler : IRequestHandler<GetUserCountsQuery, UserCountsDto>
{
    private readonly IApplicationDbContext _context;

    public GetUserCountsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserCountsDto> Handle(GetUserCountsQuery request, CancellationToken cancellationToken)
    {
        return new UserCountsDto
        {
            VerifiedLawyers = await _context.USER_DETAIL
                .CountAsync(u => u.UserRole == UserRole.Lawyer && u.State == State.AllVerified),

            PendingLawyers = await _context.USER_DETAIL
                .CountAsync(u => u.UserRole == UserRole.Lawyer && u.State == State.Pending),

            InactiveLawyers = await _context.USER_DETAIL
                .CountAsync(u => u.UserRole == UserRole.Lawyer && u.State == State.Inactive),

            ActiveLawyers = await _context.USER_DETAIL
                .CountAsync(u => u.UserRole == UserRole.Lawyer && u.State == State.Active),

            ActiveClients = await _context.USER_DETAIL
                .CountAsync(u => u.UserRole == UserRole.Client && u.State == State.Active),

            InactiveClients = await _context.USER_DETAIL
                .CountAsync(u => u.UserRole == UserRole.Client && u.State == State.Inactive)
        };
    }
}