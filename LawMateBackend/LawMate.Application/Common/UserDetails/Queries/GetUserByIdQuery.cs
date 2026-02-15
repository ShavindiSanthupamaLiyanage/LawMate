using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.Common.UserDetails.Queries;

public record GetUserByIdQuery(string UserId)
    : IRequest<UserDetailResponseDto>;

public class GetUserByIdQueryHandler
    : IRequestHandler<GetUserByIdQuery, UserDetailResponseDto>
{
    private readonly IApplicationDbContext _context;

    public GetUserByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserDetailResponseDto> Handle(
        GetUserByIdQuery request,
        CancellationToken cancellationToken)
    {
        var user = await _context.USER_DETAIL
            .AsNoTracking() // optional but recommended for queries
            .Where(x => x.UserId == request.UserId)
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
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            throw new KeyNotFoundException("User not found");

        return user;
    }
}