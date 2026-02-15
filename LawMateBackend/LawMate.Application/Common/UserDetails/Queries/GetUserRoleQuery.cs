using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.Common.UserDetails.Queries;

public record GetUserRoleQuery(string UserId)
    : IRequest<UserRoleDto>;

public class GetUserRoleQueryHandler
    : IRequestHandler<GetUserRoleQuery, UserRoleDto>
{
    private readonly IApplicationDbContext _context;

    public GetUserRoleQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserRoleDto> Handle(
        GetUserRoleQuery request,
        CancellationToken cancellationToken)
    {
        var user = await _context.USER_DETAIL
            .Where(x => x.UserId == request.UserId)
            .Select(x => new UserRoleDto
            {
                UserId = x.UserId,
                Role = x.UserRole.ToString(),
                IsDualAccount = x.IsDualAccount
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            throw new KeyNotFoundException("User not found");

        return user;
    }
}