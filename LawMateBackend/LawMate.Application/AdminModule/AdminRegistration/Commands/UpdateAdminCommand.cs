using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminRegistration.Commands;

public class UpdateAdminCommand : IRequest<bool>
{
    public string UserId { get; set; }
    public Prefix Prefix { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string NIC { get; set; }
    public string ContactNumber { get; set; }
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

        admin.Prefix = request.Prefix;
        admin.FirstName = request.FirstName;
        admin.LastName = request.LastName;
        admin.Email = request.Email;
        admin.NIC = request.NIC;
        admin.ContactNumber = request.ContactNumber;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}