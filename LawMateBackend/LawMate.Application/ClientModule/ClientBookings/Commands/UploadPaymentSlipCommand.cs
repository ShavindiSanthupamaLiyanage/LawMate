
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Booking;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientBookings.Commands;

public class UploadPaymentSlipCommand : IRequest<int>
{
    public UploadPaymentSlipDto Data { get; set; } = null!;
}

public class UploadPaymentSlipCommandHandler
    : IRequestHandler<UploadPaymentSlipCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAppLogger _logger;

    public UploadPaymentSlipCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IAppLogger logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<int> Handle(
        UploadPaymentSlipCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info("UploadPaymentSlipCommand started");

        var dto = request.Data
            ?? throw new ArgumentNullException(nameof(request.Data));

        var clientId = _currentUserService.UserId
            ?? throw new UnauthorizedAccessException("User not authenticated");

        // 1. Validate booking — must belong to this client and be Accepted
        var booking = await _context.BOOKING
            .FirstOrDefaultAsync(
                b => b.BookingId      == dto.BookingId
                     && b.ClientId    == clientId
                     && b.BookingStatus == BookingStatus.Accepted,
                cancellationToken);

        if (booking is null)
        {
            _logger.Warning($"Payment slip upload failed | Booking not found or not accepted | BookingId: {dto.BookingId}, ClientId: {clientId}");
            throw new KeyNotFoundException($"Accepted booking with ID {dto.BookingId} not found for this client.");
        }

        // 2. Prevent duplicate uploads — block if pending payment already exists
        var alreadyUploaded = await _context.BOOKING_PAYMENT
            .AnyAsync(
                p => p.BookingId          == dto.BookingId
                     && p.VerificationStatus == VerificationStatus.Pending,
                cancellationToken);

        if (alreadyUploaded)
        {
            _logger.Warning($"Duplicate slip upload attempt | BookingId: {dto.BookingId}, ClientId: {clientId}");
            throw new InvalidOperationException("A payment slip has already been submitted for this booking and is awaiting verification.");
        }

        // 3. Convert base64 → byte[]
        var base64 = dto.SlipImageBase64.Contains(',')
            ? dto.SlipImageBase64.Split(',')[1]   // strip "data:image/jpeg;base64," prefix
            : dto.SlipImageBase64;

        byte[] imageBytes;
        try
        {
            imageBytes = Convert.FromBase64String(base64);
        }
        catch (FormatException)
        {
            throw new ArgumentException("SlipImageBase64 is not a valid base64 string.");
        }

        var currentUser = _currentUserService.UserId!;

        // 4. Create BOOKING_PAYMENT record
        var payment = new BOOKING_PAYMENT
        {
            BookingId          = dto.BookingId,
            LawyerId           = booking.LawyerId,
            TransactionId      = dto.TransactionId,
            Amount             = dto.Amount,
            PaymentDate        = DateTime.Now,
            VerificationStatus = VerificationStatus.Pending,
            SlipNumber         = dto.SlipNumber,
            IsPaid             = false,
            ReceiptDocument    = imageBytes,
            CreatedBy          = currentUser,
            CreatedAt          = DateTime.Now,
        };

        _context.BOOKING_PAYMENT.Add(payment);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Payment slip uploaded | PaymentId: {payment.Id}, BookingId: {dto.BookingId}, ClientId: {clientId}");

        return payment.Id;
    }
}