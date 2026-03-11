using LawMate.Domain.Common.Enums;
using MediatR;

namespace LawMate.Application.ClientModule.ClientRegistration.Commands
{
    public class UpdateClientCommand : IRequest<string>
    {
        public string UserId { get; set; } = default!;

        // USER_DETAIL fields
        public Prefix Prefix { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public Gender Gender { get; set; }
        public string? Email { get; set; }
        public string? ContactNumber { get; set; }

        // CLIENT_DETAILS fields
        public string? Address { get; set; }
        public string? District { get; set; }
        public Language PrefferedLanguage { get; set; }
    }
}