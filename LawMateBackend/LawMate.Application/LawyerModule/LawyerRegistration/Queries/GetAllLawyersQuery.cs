using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRegistration.Queries
{
    public record GetAllLawyersQuery : IRequest<List<CreateLawyerDto>>;

    public class GetAllLawyersQueryHandler
        : IRequestHandler<GetAllLawyersQuery, List<CreateLawyerDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllLawyersQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CreateLawyerDto>> Handle(
            GetAllLawyersQuery request,
            CancellationToken cancellationToken)
        {
            return await (
                from u in _context.USER_DETAIL
                join l in _context.LAWYER_DETAILS on u.UserId equals l.UserId
                select new CreateLawyerDto
                {
                    UserId = u.UserId!,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    UserRole = u.UserRole,
                    WorkingDistrict = l.WorkingDistrict,
                    AreaOfPractice = l.AreaOfPractice,
                    VerificationStatus = l.VerificationStatus
                }
            ).ToListAsync(cancellationToken);
        }
    }
}
