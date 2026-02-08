using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRegistration.Queries
{
    public record GetLawyerByUserIdQuery(string UserId) : IRequest<CreateLawyerDto>;

    public class GetLawyerByUserIdQueryHandler
        : IRequestHandler<GetLawyerByUserIdQuery, CreateLawyerDto>
    {
        private readonly IApplicationDbContext _context;

        public GetLawyerByUserIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CreateLawyerDto> Handle(
            GetLawyerByUserIdQuery request,
            CancellationToken cancellationToken)
        {
            var result = await (
                from u in _context.USER_DETAIL
                join l in _context.LAWYER_DETAILS on u.UserId equals l.UserId
                where u.UserId == request.UserId
                select new CreateLawyerDto
                {
                    UserId = u.UserId!,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    ContactNumber = u.ContactNumber,
                    Gender = u.Gender,
                    UserRole = u.UserRole,
                    YearOfExperience = l.YearOfExperience,
                    WorkingDistrict = l.WorkingDistrict,
                    AreaOfPractice = l.AreaOfPractice,
                    AverageRating = l.AverageRating,
                    VerificationStatus = l.VerificationStatus
                }
            ).FirstOrDefaultAsync(cancellationToken);

            if (result == null)
                throw new KeyNotFoundException("Lawyer not found");

            return result;
        }
    }
}
