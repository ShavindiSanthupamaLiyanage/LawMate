using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.Common.UserDetails.Queries;

public class GetActiveUsersQuery : IRequest<List<UserDetailResponseDto>>;

public class GetActiveUsersQueryHandler
    : IRequestHandler<GetActiveUsersQuery, List<UserDetailResponseDto>>
{
    private readonly IApplicationDbContext _context;

    public GetActiveUsersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UserDetailResponseDto>> Handle(
        GetActiveUsersQuery request,
        CancellationToken cancellationToken)
    {
        return await _context.USER_DETAIL
            .Where(x => (int)x.State == 1)
            .Select(x => new UserDetailResponseDto
            {
                UserId = x.UserId,
                Prefix = x.Prefix,
                FirstName = x.FirstName,
                LastName = x.LastName,
                UserName = x.UserName,
                Gender = x.Gender,
                NIC = x.NIC,
                Email = x.Email,
                ContactNumber = x.ContactNumber,
                RecordStatus = x.RecordStatus,
                State = (int)x.State,
                UserRole = x.UserRole,
                IsDualAccount = x.IsDualAccount
            })
            .ToListAsync(cancellationToken);
    }
}
