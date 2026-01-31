namespace LawMate.API.Model.Common
{
    public class ResetPasswordRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
