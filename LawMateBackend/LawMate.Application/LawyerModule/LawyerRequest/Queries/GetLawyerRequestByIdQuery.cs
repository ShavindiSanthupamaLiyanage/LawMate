using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRequest.Queries;

public record GetLawyerRequestByIdQuery(
    int BookingId,
    string LawyerId
) : IRequest<BookingDetailDto?>;

public class GetLawyerRequestByIdQueryHandler
    : IRequestHandler<GetLawyerRequestByIdQuery, BookingDetailDto?>
{
    private readonly IApplicationDbContext _db;

    public GetLawyerRequestByIdQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<BookingDetailDto?> Handle(
        GetLawyerRequestByIdQuery request,
        CancellationToken ct)
    {
        return await (
            from b  in _db.BOOKING
            join u  in _db.USER_DETAIL    on b.ClientId equals u.UserId
            join cd in _db.CLIENT_DETAILS on b.ClientId equals cd.UserId
            where b.BookingId == request.BookingId
               && b.LawyerId  == request.LawyerId
            select new BookingDetailDto
            {
                BookingId         = b.BookingId,
                ClientName        = u.FirstName + " " + u.LastName,
                ProfilePicUrl     = u.ProfileImage,
                Email             = u.Email ?? string.Empty,
                Phone             = u.ContactNumber ?? string.Empty,
                Nic               = u.NIC ?? string.Empty,
                Address           = cd.Address ?? string.Empty,
                CaseType          = b.IssueDescription ?? string.Empty,
                CaseNote          = b.IssueDescription,
                CreatedBy         = b.CreatedBy ?? string.Empty,
                ScheduledDateTime = b.ScheduledDateTime,
                Duration          = b.Duration,
                PaymentMode       = b.PaymentMode,
                Location          = b.Location,
                Status            = b.BookingStatus,
                RejectionReason   = b.RejectionReason,
                Mode              = b.Mode,
            }
        ).FirstOrDefaultAsync(ct);
    }
}