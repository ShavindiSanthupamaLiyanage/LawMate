using MediatR;

namespace LawMate.Application.AdminModule.AdminDashboard.Commands
{
    // ✅ COMMAND
    public record RefreshDashboardCommand : IRequest<string>;

    // ✅ COMMAND HANDLER
    public class RefreshDashboardCommandHandler
        : IRequestHandler<RefreshDashboardCommand, string>
    {
        public async Task<string> Handle(
            RefreshDashboardCommand request,
            CancellationToken cancellationToken)
        {

            await Task.Delay(100, cancellationToken); // simulate work

            return "Dashboard refreshed successfully";
        }
    }
}