using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.LawyerVerification.Queries;

public record GetAllLawyerVerificationQuery : IRequest<List<LawyerVerificationListDto>>;

public class GetAllLawyerVerificationQueryHandler
    : IRequestHandler<GetAllLawyerVerificationQuery, List<LawyerVerificationListDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllLawyerVerificationQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LawyerVerificationListDto>> Handle(
        GetAllLawyerVerificationQuery request,
        CancellationToken cancellationToken)
    {
        return await (
            from u in _context.USER_DETAIL
            join l in _context.LAWYER_DETAILS on u.UserId equals l.UserId
            select new LawyerVerificationListDto
            {
                UserId = u.UserId,
                LawyerName = u.FirstName + " " + u.LastName,
                ProfileImage = u.ProfileImage,
                SCECertificateNo = l.SCECertificateNo,
                BarAssociationRegNo = l.BarAssociationRegNo,
                VerificationStatus = l.VerificationStatus
            }
        ).ToListAsync(cancellationToken);
    }
}