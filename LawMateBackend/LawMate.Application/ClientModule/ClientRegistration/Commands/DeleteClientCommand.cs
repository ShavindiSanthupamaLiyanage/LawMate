using MediatR;

namespace LawMate.Application.ClientModule.ClientRegistration.Commands
{
    public record DeleteClientCommand(string UserId) : IRequest;
}