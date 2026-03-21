using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Lawyer;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRegistration.Command;

public class UploadMembershipPaymentCommand : IRequest<string>
{
    public string LawyerId { get; set; }
    public MembershipType MembershipType { get; set; }
    public decimal Amount { get; set; }
    public IFormFile? ReceiptDocument { get; set; }
}

public class UploadMembershipPaymentCommandHandler
    : IRequestHandler<UploadMembershipPaymentCommand, string>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IAppLogger _logger;

    public UploadMembershipPaymentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUserService,
        IAppLogger logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    private static async Task<byte[]?> ConvertToByteArrayAsync(IFormFile? file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return null;

        await using var ms = new MemoryStream();
        await file.CopyToAsync(ms, ct);
        return ms.ToArray();
    }

    private static string GenerateTransactionId()
    {
        return $"TXN-{Guid.NewGuid().ToString("N")[..10].ToUpper()}";
    }

    public async Task<string> Handle(
        UploadMembershipPaymentCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"UploadMembershipPayment started | LawyerId: {request.LawyerId}");

        var lawyerExists = await _context.LAWYER_DETAILS
            .AnyAsync(x => x.UserId == request.LawyerId, cancellationToken);

        if (!lawyerExists)
            throw new Exception("Lawyer not found.");

        var receiptBytes = await ConvertToByteArrayAsync(request.ReceiptDocument, cancellationToken);

        var paymentDate = DateTime.Now;

        var membershipStartDate = DateTime.Today.AddDays(1);

        DateTime membershipEndDate;

        if (request.MembershipType == MembershipType.Monthly)
        {
            membershipEndDate = membershipStartDate.AddDays(30);
        }
        else
        {
            membershipEndDate = membershipStartDate.AddDays(180);
        }

        var payment = new MEMBERSHIP_PAYMENT
        {
            LawyerId = request.LawyerId,
            TransactionId = GenerateTransactionId(),
            Amount = request.Amount,
            PaymentDate = paymentDate,
            MembershipStartDate = membershipStartDate,
            MembershipEndDate = membershipEndDate,
            PaymentStatus = PaymentStatus.Paid,
            VerificationStatus = VerificationStatus.Pending,
            ReceiptDocument = receiptBytes,
            IsExpired = false,
            CreatedAt = DateTime.Now,
            CreatedBy = _currentUserService.UserId
        };

        _context.MEMBERSHIP_PAYMENT.Add(payment);

        var user = await _context.USER_DETAIL
            .FirstOrDefaultAsync(x => x.UserId == request.LawyerId, cancellationToken);

        if (user != null)
        {
            user.State = State.Active;
        }
        
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Membership payment uploaded | LawyerId: {request.LawyerId} | TransactionId: {payment.TransactionId}");

        return payment.TransactionId;
    }
}