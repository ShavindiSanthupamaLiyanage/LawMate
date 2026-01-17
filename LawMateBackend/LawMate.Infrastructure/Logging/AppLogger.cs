using LawMate.Application.Common.Interfaces;
using System;
using System.Runtime.CompilerServices;

namespace LawMate.Infrastructure.Logging
{
    public class AppLogger : IAppLogger
    {
        public void Info(
            string message,
            [CallerFilePath] string file = "",
            [CallerMemberName] string method = "",
            [CallerLineNumber] int line = 0)
        {
            LawMateLogger.Info(message, file, method, line);
        }

        public void Warning(
            string message,
            [CallerFilePath] string file = "",
            [CallerMemberName] string method = "",
            [CallerLineNumber] int line = 0)
        {
            LawMateLogger.Warning(message, file, method, line);
        }

        public void Error(
            string message,
            Exception ex = null,
            [CallerFilePath] string file = "",
            [CallerMemberName] string method = "",
            [CallerLineNumber] int line = 0)
        {
            LawMateLogger.Error(message, ex, file, method, line);
        }
    }
}
