using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRequest.Queries;

public record GetLawyerRequestsQuery(
    string LawyerId,
    BookingStatus StatusFilter
) : IRequest<IEnumerable<BookingListItemDto>>;

public class GetLawyerRequestsQueryHandler
    : IRequestHandler<GetLawyerRequestsQuery, IEnumerable<BookingListItemDto>>
{
    private readonly IApplicationDbContext _db;

    public GetLawyerRequestsQueryHandler(IApplicationDbContext db) => _db = db;

    public async Task<IEnumerable<BookingListItemDto>> Handle(
        GetLawyerRequestsQuery request,
        CancellationToken ct)
    {
        var allowedStatuses = request.StatusFilter == BookingStatus.Confirmed
            ? new[] { BookingStatus.Confirmed, BookingStatus.Accepted }
            : new[] { request.StatusFilter };

        var query =
            from b  in _db.BOOKING
            join u  in _db.USER_DETAIL    on b.ClientId equals u.UserId
            join cd in _db.CLIENT_DETAILS on b.ClientId equals cd.UserId
            where b.LawyerId == request.LawyerId
               && allowedStatuses.Contains(b.BookingStatus)
            orderby b.CreatedAt descending
            select new BookingListItemDto
            {
                BookingId         = b.BookingId,
                ClientName        = u.FirstName + " " + u.LastName,
                ProfilePicUrl     = u.ProfileImage,
                CaseType          = b.IssueDescription ?? string.Empty,
                Phone             = u.ContactNumber ?? string.Empty,
                ScheduledDateTime = b.ScheduledDateTime,
                Mode              = b.PaymentMode,
                Status            = b.BookingStatus,
                RejectionReason   = b.RejectionReason,
                CreatedAt         = b.CreatedAt ?? DateTime.UtcNow,
            };

        return await query.ToListAsync(ct);
    }
}