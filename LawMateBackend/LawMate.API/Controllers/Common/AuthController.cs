using LawMate.API.Model.Common;
using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.Utilities;
using LawMate.Domain.Common.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LawMate.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IApplicationDbContext _context;
        private readonly IAppLogger _logger;

        public AuthController(IConfiguration configuration, 
            IApplicationDbContext context, 
            IAppLogger logger)
        {
            _configuration = configuration;
            _context = context;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            _logger.Info($"Login attempt | UserId: {request.UserId}");

            if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.Password))
            {
                _logger.Warning("Login failed | Missing credentials");
                return BadRequest("UserId and Password are required.");
            }

            //Encrypt input password with the same key (UserId)
            string encryptedInputPassword = CryptoUtil.Encrypt(request.Password, request.UserId);

            var user = await _context.USER_DETAIL.FirstOrDefaultAsync(x =>
                    x.UserId == request.UserId &&
                    x.Password == encryptedInputPassword &&  // compare encrypted
                    x.RecordStatus == 0); // active check

            if (user == null)
            {
                _logger.Warning($"Login failed | Invalid credentials | UserId: {request.UserId}");
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

    }
}