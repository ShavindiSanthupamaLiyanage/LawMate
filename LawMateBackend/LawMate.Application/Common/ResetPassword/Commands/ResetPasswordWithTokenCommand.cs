using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.Utilities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.Common.ResetPassword.Commands;

public class ResetPasswordWithTokenCommand : IRequest<string>
{
    public string Token { get; set; } 
    public string NewPassword { get; set; } 
}

public class ResetPasswordWithTokenCommandHandler
    : IRequestHandler<ResetPasswordWithTokenCommand, string>
{
    private readonly IApplicationDbContext _context;

    public ResetPasswordWithTokenCommandHandler(
        IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> Handle(
        ResetPasswordWithTokenCommand request,
        CancellationToken cancellationToken)
    {
        var token = await _context.PASSWORD_RESET_TOKEN
            .FirstOrDefaultAsync(x =>
                    x.Token == request.Token &&
                    !x.IsUsed &&
                    x.ExpiryDate > DateTime.UtcNow,
                cancellationToken);

        if (token == null)
            throw new Exception("Invalid or expired token.");

        var user = await _context.USER_DETAIL
            .FirstAsync(x => x.UserId == token.UserId);

        user.Password = CryptoUtil.Encrypt(
            request.NewPassword,
            user.UserId);
        user.ModifiedBy = user.UserId;
        user.ModifiedAt = DateTime.UtcNow;

        token.IsUsed = true;
        token.ModifiedBy = user.UserId;
        token.ModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return "Password reset successful.";
    }
}