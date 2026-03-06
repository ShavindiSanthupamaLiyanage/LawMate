using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.Common.ResetPassword.Queries;

public class VerifyResetTokenQuery : IRequest<bool>
{
    public string Token { get; set; }
}

public class VerifyResetTokenQueryHandler
    : IRequestHandler<VerifyResetTokenQuery, bool>
{
    private readonly IApplicationDbContext _context;

    public VerifyResetTokenQueryHandler(
        IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(
        VerifyResetTokenQuery request,
        CancellationToken cancellationToken)
    {
        var token = await _context.PASSWORD_RESET_TOKEN
            .FirstOrDefaultAsync(x =>
                    x.Token == request.Token &&
                    !x.IsUsed &&
                    x.ExpiryDate > DateTime.UtcNow,
                cancellationToken);

        return token != null;
    }

}