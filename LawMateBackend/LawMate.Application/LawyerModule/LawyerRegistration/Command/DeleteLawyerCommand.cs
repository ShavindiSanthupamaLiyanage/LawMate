using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Application.LawyerModule.LawyerRegistration.Command
{
    public record DeleteLawyerCommand(string UserId) : IRequest;

    public class DeleteLawyerCommandHandler
        : IRequestHandler<DeleteLawyerCommand>
    {
        private readonly IApplicationDbContext _context;

        public DeleteLawyerCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task Handle(DeleteLawyerCommand request, CancellationToken cancellationToken)
        {
            var user = await _context.USER_DETAIL
                .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

            var lawyer = await _context.LAWYER_DETAILS
                .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

            if (lawyer != null)
                _context.LAWYER_DETAILS.Remove(lawyer);

            if (user != null)
                _context.USER_DETAIL.Remove(user);

            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}