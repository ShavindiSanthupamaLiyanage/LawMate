﻿using LawMate.API.Model.Common;
using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LawMate.Application.Common.ResetPassword.Commands;
using LawMate.Application.Common.ResetPassword.Queries;
using MediatR;

namespace LawMate.API.Controllers.Common
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAppLogger _logger;
        private readonly IMediator _mediator;

        public AuthController(IConfiguration configuration,
            IApplicationDbContext context,
            ICurrentUserService currentUserService,
            IAppLogger logger,
            IMediator mediator)
        {
            _configuration = configuration;
            _context = context;
            _currentUserService = currentUserService;
            _logger = logger;
            _mediator = mediator;
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
                .FirstOrDefault(u => u.Password == CryptoUtil.Encrypt(request.Password ?? string.Empty, u.UserId ?? string.Empty));

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
                isDualAccount = matchedUser.IsDualAccount,
                accountStatus = matchedUser.State
            });
        }

        [AllowAnonymous]
        [HttpPost("request-reset-password")]
        public async Task<IActionResult> RequestReset(
            RequestPasswordResetCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
        
        [AllowAnonymous]
        [HttpGet("verify-reset-token")]
        public async Task<IActionResult> VerifyResetToken([FromQuery] string token)
        {
            var isValid = await _mediator.Send(
                new VerifyResetTokenQuery { Token = token });

            if (!isValid)
                return BadRequest("Invalid or expired token.");

            return Ok("Token valid.");
        }

        [AllowAnonymous]
        [HttpPost("reset-password-with-token")]
        public async Task<IActionResult> ResetPasswordWithToken(
            [FromBody] ResetPasswordWithTokenCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }
    }
}