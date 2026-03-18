using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminRegistration.Commands;

public class UpdateAdminCommand : IRequest<bool>
{
    public string UserId { get; set; } = default!;
    public Prefix? Prefix { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public Gender? Gender { get; set; }
    public string? Email { get; set; }
    public string? NIC { get; set; }
    public string? ContactNumber { get; set; }
}

public class UpdateAdminCommandHandler : IRequestHandler<UpdateAdminCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateAdminCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateAdminCommand request, CancellationToken cancellationToken)
    {
        var admin = await _context.USER_DETAIL
            .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

        if (admin == null)
            throw new Exception("Admin not found");

        if (request.Prefix.HasValue)
            admin.Prefix = request.Prefix.Value;

        if (!string.IsNullOrWhiteSpace(request.FirstName))
            admin.FirstName = request.FirstName.Trim();

        if (!string.IsNullOrWhiteSpace(request.LastName))
            admin.LastName = request.LastName.Trim();

        if (!string.IsNullOrWhiteSpace(request.Email))
            admin.Email = request.Email.Trim();

        if (!string.IsNullOrWhiteSpace(request.ContactNumber))
            admin.ContactNumber = request.ContactNumber.Trim();

        if (request.Gender.HasValue)
            admin.Gender = request.Gender.Value;

        // NIC is intentionally excluded from updates here to keep identity-critical values immutable.

        admin.UserName = $"{admin.FirstName} {admin.LastName}".Trim();

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}