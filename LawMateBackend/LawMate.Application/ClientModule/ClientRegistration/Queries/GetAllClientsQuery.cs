using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientRegistration.Queries
{
    public record GetAllClientsQuery : IRequest<List<GetClientDto>>;

    public class GetAllClientsQueryHandler
        : IRequestHandler<GetAllClientsQuery, List<GetClientDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllClientsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<GetClientDto>> Handle(
            GetAllClientsQuery request,
            CancellationToken cancellationToken)
        {
            return await (
                from u in _context.USER_DETAIL
                join c in _context.CLIENT_DETAILS on u.UserId equals c.UserId
                where u.RecordStatus == 0
                select new GetClientDto
                {
                    UserId = u.UserId!,
                    Prefix = u.Prefix,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    NIC = u.NIC,
                    Gender = u.Gender,
                    ContactNumber = u.ContactNumber,
                    RecordStatus = u.RecordStatus,
                    State = u.State,
                    RegistrationDate = u.RegistrationDate,
                    ProfileImage = u.ProfileImage,
                    IsDualAccount = u.IsDualAccount,

                    Address = c.Address,
                    District = c.District,
                    PrefferedLanguage = c.PrefferedLanguage
                }
            ).ToListAsync(cancellationToken);
        }
    }
}