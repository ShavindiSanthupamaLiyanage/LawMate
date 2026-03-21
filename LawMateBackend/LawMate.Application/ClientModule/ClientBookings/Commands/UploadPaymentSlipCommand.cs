using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientBookings.Commands;

public class UploadPaymentSlipCommand : IRequest<int>
{
    public int    BookingId       { get; set; }
    public string SlipImageBase64 { get; set; } = string.Empty;
}

public class UploadPaymentSlipCommandHandler
    : IRequestHandler<UploadPaymentSlipCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService   _currentUserService;
    private readonly IAppLogger            _logger;

    public UploadPaymentSlipCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService   currentUserService,
        IAppLogger            logger)
    {
        _context            = context;
        _currentUserService = currentUserService;
        _logger             = logger;
    }

    public async Task<int> Handle(
        UploadPaymentSlipCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info("UploadPaymentSlipCommand started");

        var clientId = _currentUserService.UserId
            ?? throw new UnauthorizedAccessException("User not authenticated");

        // 1. Validate booking — must belong to this client and be Accepted
        var booking = await _context.BOOKING
            .FirstOrDefaultAsync(
                b => b.BookingId     == request.BookingId
                  && b.ClientId      == clientId
                  && b.BookingStatus == BookingStatus.Accepted,
                cancellationToken);

        if (booking is null)
        {
            _logger.Warning($"Slip upload failed | BookingId: {request.BookingId}, ClientId: {clientId}");
            throw new KeyNotFoundException($"Accepted booking {request.BookingId} not found for this client.");
        }

        // 2. Prevent duplicate uploads
        var alreadyUploaded = await _context.BOOKING_PAYMENT
            .AnyAsync(
                p => p.BookingId          == request.BookingId
                  && p.VerificationStatus == VerificationStatus.Pending,
                cancellationToken);

        if (alreadyUploaded)
        {
            _logger.Warning($"Duplicate slip upload | BookingId: {request.BookingId}");
            throw new InvalidOperationException("A payment slip has already been submitted for this booking.");
        }

        // 3. Convert base64 → byte[]
        var base64 = request.SlipImageBase64.Contains(',')
            ? request.SlipImageBase64.Split(',')[1]
            : request.SlipImageBase64;

        byte[] imageBytes;
        try
        {
            imageBytes = Convert.FromBase64String(base64);
        }
        catch (FormatException)
        {
            throw new ArgumentException("SlipImageBase64 is not a valid base64 string.");
        }

        // 4. Save only BookingId + slip image
        var payment = new BOOKING_PAYMENT
        {
            BookingId          = request.BookingId,
            LawyerId           = booking.LawyerId,
            VerificationStatus = VerificationStatus.Pending,
            IsPaid             = false,
            ReceiptDocument    = imageBytes,
            CreatedBy          = clientId,
            CreatedAt          = DateTime.Now,
        };

        _context.BOOKING_PAYMENT.Add(payment);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Slip uploaded | PaymentId: {payment.Id}, BookingId: {request.BookingId}");

        return payment.Id;
    }
}