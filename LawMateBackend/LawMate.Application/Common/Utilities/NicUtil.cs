namespace LawMate.Application.Common.Utilities;

public static class NicUtil
{
    public static string ValidateAndNormalize(string? nic)
    {
        if (string.IsNullOrWhiteSpace(nic))
            throw new Exception("NIC cannot be blank.");

        nic = nic.Trim().ToUpper();

        if (System.Text.RegularExpressions.Regex.IsMatch(nic, @"^\d{12}$"))
            return nic;

        if (System.Text.RegularExpressions.Regex.IsMatch(nic, @"^\d{9}[VX]$"))
            return nic;

        throw new Exception("Invalid NIC format. NIC must be 12 digits OR 9 digits followed by V or X.");
    }
}
