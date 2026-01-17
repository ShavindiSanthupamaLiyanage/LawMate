using System;
using System.Runtime.CompilerServices;

namespace LawMate.Application.Common.Interfaces
{
    public interface IAppLogger
    {
        void Info(
            string message,
            [CallerFilePath] string file = "",
            [CallerMemberName] string method = "",
            [CallerLineNumber] int line = 0);

        void Warning(
            string message,
            [CallerFilePath] string file = "",
            [CallerMemberName] string method = "",
            [CallerLineNumber] int line = 0);

        void Error(
            string message,
            Exception ex = null,
            [CallerFilePath] string file = "",
            [CallerMemberName] string method = "",
            [CallerLineNumber] int line = 0);
    }
}
