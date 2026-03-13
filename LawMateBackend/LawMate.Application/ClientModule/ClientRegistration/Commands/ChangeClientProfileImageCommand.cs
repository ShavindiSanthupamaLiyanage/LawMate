using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Entities.Auth;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientRegistration.Commands
{
    public class ChangeClientProfileImageCommand : IRequest<USER_DETAIL>
    {
        public string UserId { get; set; } = default!;
        public IFormFile? ProfileImage { get; set; }
    }

    public class ChangeClientProfileImageCommandHandler
        : IRequestHandler<ChangeClientProfileImageCommand, USER_DETAIL>
    {
        private readonly IApplicationDbContext _context;

        public ChangeClientProfileImageCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<USER_DETAIL> Handle(ChangeClientProfileImageCommand request, CancellationToken cancellationToken)
        {
            var user = await _context.USER_DETAIL
                .FirstOrDefaultAsync(
                    x => x.UserId == request.UserId && x.RecordStatus == 0,
                    cancellationToken);

            if (user == null)
                throw new KeyNotFoundException("Client not found");

            if (request.ProfileImage != null && request.ProfileImage.Length > 0)
            {
                using var ms = new MemoryStream();
                await request.ProfileImage.CopyToAsync(ms, cancellationToken);
                user.ProfileImage = ms.ToArray();
            }

            await _context.SaveChangesAsync(cancellationToken);
            return user;
        }
    }
}