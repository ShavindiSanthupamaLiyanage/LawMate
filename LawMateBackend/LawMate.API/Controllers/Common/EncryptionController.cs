using LawMate.API.Model.Common;
using LawMate.Application.Common.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.Common
{
    [Route("api/encryption")]
    [ApiController]
    public class EncryptionController : ControllerBase
    {
        [HttpPost("password-encrypt")]
        public IActionResult EncryptPassword([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.UserId))
            {
                return BadRequest("PlainText and UserId cannot be empty.");
            }

            string encryptedText = CryptoUtil.Encrypt(request.Password, request.UserId);
            return Ok(new { encryptedPassword = encryptedText });
        }

        [HttpPost("password-decrypt")]
        public IActionResult DecryptPassword([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Password) || string.IsNullOrEmpty(request.UserId))
            {
                return BadRequest("EncryptedPassword and UserId cannot be empty.");
            }

            string decryptedText = CryptoUtil.Decrypt(request.Password, request.UserId);
            return Ok(new { decryptedPassword = decryptedText });
        }
    }
}
