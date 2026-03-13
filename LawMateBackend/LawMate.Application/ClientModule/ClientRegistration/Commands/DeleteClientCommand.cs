using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientRegistration.Commands
{
    public record DeleteClientCommand(string UserId) : IRequest;

    public class DeleteClientCommandHandler : IRequestHandler<DeleteClientCommand>
    {
        private readonly IApplicationDbContext _context;

        public DeleteClientCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(DeleteClientCommand request, CancellationToken cancellationToken)
        {
            var user = await _context.USER_DETAIL
                .FirstOrDefaultAsync(
                    x => x.UserId == request.UserId
                         && x.RecordStatus == 0, // only active records
                    cancellationToken);

            if (user == null)
                throw new KeyNotFoundException("Client not found");

            // ✅ Soft delete
            user.RecordStatus = 1;

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}