namespace LawMate.API.Model.Common
{
    public class LoginRequest
    {
        public string NIC { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
