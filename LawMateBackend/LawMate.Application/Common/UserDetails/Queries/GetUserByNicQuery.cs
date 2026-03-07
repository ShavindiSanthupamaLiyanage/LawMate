using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.Common.UserDetails.Queries;

public class GetUserByNicQuery : IRequest<UserDetailResponseDto>
{
    public string Nic { get; set; }
}

public class GetUserByNicQueryHandler
    : IRequestHandler<GetUserByNicQuery, UserDetailResponseDto>
{
    private readonly IApplicationDbContext _context;

    public GetUserByNicQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserDetailResponseDto> Handle(
        GetUserByNicQuery request,
        CancellationToken cancellationToken)
    {
        var user = await _context.USER_DETAIL
            .AsNoTracking()
            .Where(x => x.NIC == request.Nic)
            .Select(x => new UserDetailResponseDto
            {
                Email = x.Email
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            throw new KeyNotFoundException("User not found");

        return user;
    }
}