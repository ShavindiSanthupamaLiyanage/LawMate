using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace LawMate.Infrastructure.Services;

public class MembershipExpiryService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public MembershipExpiryService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _serviceProvider.CreateScope();

            var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            var templateService = scope.ServiceProvider.GetRequiredService<IEmailTemplateService>();

            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            var payments = await context.MEMBERSHIP_PAYMENT
                .Where(x => x.MembershipEndDate != null && !x.IsExpired)
                .ToListAsync(stoppingToken);

            foreach (var payment in payments)
            {
                var user = await context.USER_DETAIL
                    .FirstOrDefaultAsync(x => x.UserId == payment.LawyerId, stoppingToken);

                if (user == null)
                    continue;

                var endDate = payment.MembershipEndDate.Value.Date;

                // Reminder Email
                if (endDate == tomorrow)
                {
                    var template = templateService.LoadTemplate("MembershipReminder.html");

                    template = template
                        .Replace("{{FullName}}", $"{user.FirstName} {user.LastName}")
                        .Replace("{{EndDate}}", endDate.ToString("yyyy-MM-dd"))
                        .Replace("{{LogoUrl}}", "https://yourlogo.com/logo.png");

                    await emailService.SendAsync(
                        user.Email,
                        "LawMate Membership Expiring Tomorrow",
                        template);
                }

                // Expired Membership
                if (endDate < today)
                {
                    payment.IsExpired = true;

                    user.State = 0; // pending lawyer

                    var template = templateService.LoadTemplate("MembershipExpired.html");

                    template = template
                        .Replace("{{FullName}}", $"{user.FirstName} {user.LastName}")
                        .Replace("{{EndDate}}", endDate.ToString("yyyy-MM-dd"))
                        .Replace("{{LogoUrl}}", "https://yourlogo.com/logo.png");

                    await emailService.SendAsync(
                        user.Email,
                        "LawMate Membership Expired",
                        template);
                }
            }

            await context.SaveChangesAsync(stoppingToken);

            // run once per day
            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }
}