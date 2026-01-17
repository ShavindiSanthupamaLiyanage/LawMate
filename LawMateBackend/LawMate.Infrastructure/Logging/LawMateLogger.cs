using System;
using System.IO;
using System.Runtime.CompilerServices;
using System.Text;

namespace LawMate.Infrastructure.Logging
{
    public static class LawMateLogger
    {
        private static readonly object _lock = new object();

        private static string LogDirectory => @"C:\LawMate\Logs\";

        private static string LogFilePath
        {
            get
            {
                string today = DateTime.Now.ToString("yyyy-MM-dd");
                return Path.Combine(LogDirectory, $"Log-LawMate-{today}.txt");
            }
        }

        public static void Write(
            string level,
            string message,
            [CallerFilePath] string file = "",
            [CallerMemberName] string method = "",
            [CallerLineNumber] int line = 0)
        {
            lock (_lock)
            {
                try
                {
                    if (!Directory.Exists(LogDirectory))
                        Directory.CreateDirectory(LogDirectory);

                    using (StreamWriter writer = new StreamWriter(LogFilePath, true))
                    {
                        writer.WriteLine("--------------------------------------------------");
                        writer.WriteLine($"Time   : {DateTime.Now}");
                        writer.WriteLine($"Level  : {level}");
                        writer.WriteLine($"File   : {Path.GetFileName(file)}");
                        writer.WriteLine($"Method : {method}");
                        writer.WriteLine($"Line   : {line}");
                        writer.WriteLine($"Message: {message}");
                        writer.WriteLine();
                    }
                }
                catch
                {
                    // Never throw logging errors
                }
            }
        }

        public static void Info(
            string message,
            [CallerFilePath] string file = "",
            [CallerMemberName] string method = "",
            [CallerLineNumber] int line = 0)
            => Write("INFO", message, file, method, line);

        public static void Warning(
            string message,
            [CallerFilePath] string file = "",
            [CallerMemberName] string method = "",
            [CallerLineNumber] int line = 0)
            => Write("WARN", message, file, method, line);

        public static void Error(
            string message,
            Exception ex = null,
            [CallerFilePath] string file = "",
            [CallerMemberName] string method = "",
            [CallerLineNumber] int line = 0)
        {
            var sb = new StringBuilder(message);

            if (ex != null)
            {
                sb.AppendLine();
                sb.AppendLine("Exception Type: " + ex.GetType());
                sb.AppendLine("Message: " + ex.Message);
                sb.AppendLine("StackTrace: " + ex.StackTrace);
                if (ex.InnerException != null)
                {
                    sb.AppendLine("---- Inner Exception ----");
                    sb.AppendLine(ex.InnerException.Message);
                }
            }

            Write("ERROR", sb.ToString(), file, method, line);
        }
    }
}
