using LawMate.Domain.DTOs;
using MediatR;

namespace LawMate.Application.ClientModule.ClientRegistration.Commands
{
    public class CreateClientCommand : IRequest<string>
    {
        public CreateClientDto Data { get; set; } = default!;
    }
}