using LawMate.API.Model.Common;
using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LawMate.API.Controllers.Common
{
    [ApiController]
    [Route("api/common")]
    public class CommonController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAppLogger _logger;

        public CommonController(IConfiguration configuration,
            IApplicationDbContext context,
            ICurrentUserService currentUserService,
            IAppLogger logger)
        {
            _configuration = configuration;
            _context = context;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            _logger.Info($"Login attempt | UserName: {request.UserName}");

            if (string.IsNullOrEmpty(request.UserName) || string.IsNullOrEmpty(request.Password))
            {
                _logger.Warning("Login failed | Missing credentials");
                return BadRequest("UserName and Password are required.");
            }

            //Encrypt input password with the same key (UserId)
            string encryptedInputPassword = CryptoUtil.Encrypt(request.Password, request.UserName);

            var user = await _context.USER_DETAIL.FirstOrDefaultAsync(x =>
                    x.UserName == request.UserName &&
                    x.Password == encryptedInputPassword &&  // compare encrypted
                    x.RecordStatus == 0); // active check

            if (user == null)
            {
                _logger.Warning($"Login failed | Invalid credentials | UserId: {request.UserName}");
                return Unauthorized("Invalid UserId or Password");
            }

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, user.UserRole.ToString()),
                new Claim("UserId", user.UserId!),
                new Claim("Email", user.Email ?? "")
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(
                    Convert.ToDouble(_configuration["Jwt:ExpireMinutes"])
                ),
                signingCredentials: creds
            );

            _logger.Info($"Login successful | UserId: {user.UserId} | Role: {user.UserRole}");

            user.LastLoginDate = DateTime.Now;
            await _context.SaveChangesAsync(CancellationToken.None);

            return Ok(new
            {
                accessToken = new JwtSecurityTokenHandler().WriteToken(token),
                userId = user.UserId,
                role = user.UserRole
            });
        }

        [AllowAnonymous]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            _logger.Info($"Password reset attempt | UserName: {request.UserName}");

            // 1. Basic validation
            if (string.IsNullOrWhiteSpace(request.UserName) ||
                string.IsNullOrWhiteSpace(request.NewPassword) ||
                string.IsNullOrWhiteSpace(request.ConfirmPassword))
            {
                _logger.Warning("Password reset failed | Missing fields");
                return BadRequest("UserName, NewPassword and ConfirmPassword are required.");
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                _logger.Warning("Password reset failed | Password mismatch");
                return BadRequest("NewPassword and ConfirmPassword do not match.");
            }

            // 2. Check user existence
            var user = await _context.USER_DETAIL
                .FirstOrDefaultAsync(x =>
                    x.UserName == request.UserName &&
                    x.RecordStatus == 0);

            if (user == null)
            {
                _logger.Warning($"Password reset failed | User not found | {request.UserName}");
                return NotFound("User not found.");
            }

            // 3. Encrypt new password using same logic as login
            string encryptedPassword = CryptoUtil.Encrypt(request.NewPassword, request.UserName);

            // 4. Update password
            user.Password = encryptedPassword;
            user.ModifiedAt = DateTime.Now;
            user.ModifiedBy = _currentUserService.UserId;

            await _context.SaveChangesAsync(CancellationToken.None);

            _logger.Info($"Password reset successful | UserName: {request.UserName}");

            return Ok("Password reset successfully.");
        }

    }
}