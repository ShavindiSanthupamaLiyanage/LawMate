using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.Utilities;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientRegistration.Commands
{
    public class CreateClientCommand : IRequest<string>
    {
        public CreateClientDto Data { get; set; } = default!;
    }

    public class CreateClientCommandHandler : IRequestHandler<CreateClientCommand, string>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAppLogger _logger;

        public CreateClientCommandHandler(
            IApplicationDbContext context,
            ICurrentUserService currentUserService,
            IAppLogger logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public async Task<string> Handle(CreateClientCommand request, CancellationToken cancellationToken)
        {
            _logger.Info("CreateClientCommand started");

            var dto = request.Data ?? throw new ArgumentNullException(nameof(request.Data));

            if (string.IsNullOrWhiteSpace(dto.NIC))
                throw new Exception("NIC is required.");

            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new Exception("Password is required.");

            // Normalize NIC
            var normalizedNic = NicUtil.ValidateAndNormalize(dto.NIC);

            // Check existing accounts with same NIC (like lawyer flow)
            var existingUsers = await _context.USER_DETAIL
                .Where(x => x.NIC == normalizedNic)
                .ToListAsync(cancellationToken);

            // Block if Client already exists
            if (existingUsers.Any(x => x.UserRole == UserRole.Client && x.RecordStatus == 0))
            {
                _logger.Warning($"Client creation failed | Client already exists for NIC: {normalizedNic}");
                throw new Exception("A Client account already exists for this NIC.");
            }

            // Block if already 2 accounts (means Lawyer + Client already exist)
            if (existingUsers.Count == 2)
            {
                _logger.Warning($"Client creation failed | NIC already has both accounts: {normalizedNic}");
                throw new Exception("This NIC already has both Lawyer and Client accounts.");
            }

            // If a Lawyer already exists for this NIC -> dual account
            bool isDualAccount = false;
            var existingLawyer = existingUsers.FirstOrDefault(x => x.UserRole == UserRole.Lawyer && x.RecordStatus == 0);

            if (existingLawyer != null)
            {
                isDualAccount = true;
                existingLawyer.IsDualAccount = true;
                _logger.Info($"NIC {normalizedNic} now has dual accounts. Updating existing Lawyer to IsDualAccount = true.");
            }

            // Optional: check duplicate email (only if email provided)
            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                bool emailExists = await _context.USER_DETAIL
                    .AnyAsync(x => x.Email == dto.Email && x.RecordStatus == 0, cancellationToken);

                if (emailExists)
                    throw new Exception("Email already registered.");
            }

            // Start transaction (like lawyer)
            await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                // Create USER_DETAIL first
                var user = new USER_DETAIL
                {
                    Prefix = TryParseEnum(dto.Prefix, Prefix.Mr),
                    FirstName = dto.FirstName?.Trim(),
                    LastName = dto.LastName?.Trim(),
                    UserRole = UserRole.Client,
                    Gender = TryParseEnum(dto.Gender, Gender.Male),
                    Email = dto.Email?.Trim(),
                    NIC = normalizedNic,
                    ContactNumber = dto.ContactNumber?.Trim(),
                    RecordStatus = 0,
                    State = State.Active,
                    RegistrationDate = DateTime.Now,
                    IsDualAccount = isDualAccount,
                    CreatedBy = _currentUserService.UserId,
                    CreatedAt = DateTime.Now
                };

                _context.USER_DETAIL.Add(user);
                await _context.SaveChangesAsync(cancellationToken);

                // Reload to get computed UserId (same as lawyer)
                await ((DbContext)_context).Entry(user).ReloadAsync(cancellationToken);

                // Encrypt password using generated userId
                user.Password = CryptoUtil.Encrypt(dto.Password ?? "", user.UserId);
                user.UserName = $"{dto.FirstName} {dto.LastName}".Trim();
                await _context.SaveChangesAsync(cancellationToken);

                // Create CLIENT_DETAILS
                var client = new CLIENT_DETAILS
                {
                    UserId = user.UserId!,
                    Address = dto.Address?.Trim(),
                    District = dto.District?.Trim(),
                    PrefferedLanguage = TryParseEnum(dto.PreferredLanguage, Language.English)
                };

                _context.CLIENT_DETAILS.Add(client);
                await _context.SaveChangesAsync(cancellationToken);

                await transaction.CommitAsync(cancellationToken);

                _logger.Info($"Client created | UserId: {user.UserId}");
                return user.UserId!;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                _logger.Error("Client creation failed", ex);
                throw;
            }
        }

        private static TEnum TryParseEnum<TEnum>(string? value, TEnum fallback) where TEnum : struct
        {
            if (string.IsNullOrWhiteSpace(value)) return fallback;

            var cleaned = value.Replace(".", "").Replace(" ", "");
            return Enum.TryParse<TEnum>(cleaned, true, out var parsed) ? parsed : fallback;
        }
    }
}