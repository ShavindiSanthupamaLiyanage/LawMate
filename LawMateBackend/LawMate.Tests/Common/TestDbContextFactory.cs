using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace LawMate.Tests.Common
{
    public static class TestDbContextFactory
    {
        public static ApplicationDbContext Create(string dbName = "TestDb")
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning)) // suppress transaction warnings
                .Options;

            return new ApplicationDbContext(options);
        }
    }
}