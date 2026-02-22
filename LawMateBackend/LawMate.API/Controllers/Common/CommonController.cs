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
            _logger.Info($"Login attempt | NIC: {request.NIC }");

            if (string.IsNullOrEmpty(request.NIC ) || string.IsNullOrEmpty(request.Password))
            {
                _logger.Warning("Login failed | Missing credentials");
                return BadRequest("NIC and Password are required.");
            }
            
            // Normalize NIC (V/X to uppercase)
            string normalizedNic;
            try
            {
                normalizedNic = NicUtil.ValidateAndNormalize(request.NIC);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            var users = await _context.USER_DETAIL
                .Where(x => x.NIC == normalizedNic && x.RecordStatus == 0)
                .ToListAsync();
            
            if (users == null)
            {
                _logger.Warning($"Login failed | Invalid credentials | NIC: {request.NIC }");
                return Unauthorized("Invalid UserId or Password");
            }
            
            // Match password against any account
            var matchedUser = users
                .FirstOrDefault(u => u.Password == CryptoUtil.Encrypt(request.Password, u.UserId));

            if (matchedUser == null)
            {
                _logger.Warning($"Login failed | Incorrect password | NIC: {normalizedNic}");
                return Unauthorized("Invalid NIC or Password");
            }

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, matchedUser.UserId!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, matchedUser.UserRole.ToString()),
                new Claim("UserId", matchedUser.UserId!),
                new Claim("Email", matchedUser.Email ?? "")
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

            _logger.Info($"Login successful | NIC: {matchedUser.NIC} | Role: {matchedUser.UserRole}");

            matchedUser.LastLoginDate = DateTime.Now;
            await _context.SaveChangesAsync(CancellationToken.None);

            return Ok(new
            {
                accessToken = new JwtSecurityTokenHandler().WriteToken(token),
                userId = matchedUser.UserId,
                role = matchedUser.UserRole,
                isDualAccount = matchedUser.IsDualAccount
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