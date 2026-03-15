using LawMate.API.Model.Chatbot;
using LawMate.API.Services.Chatbot;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.Common
{
    [ApiController]
    [Route("api/chatbot")]
    public class ChatbotController : ControllerBase
    {
        private readonly OpenAiChatbotService _openAiChatbotService;

        public ChatbotController(OpenAiChatbotService openAiChatbotService)
        {
            _openAiChatbotService = openAiChatbotService;
        }

        [HttpPost("classify")]
        public async Task<IActionResult> ClassifyIssue([FromBody] ChatbotClassificationRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.IssueText))
            {
                return BadRequest(new { message = "IssueText is required." });
            }

            var response = await _openAiChatbotService.ClassifyIssueAsync(request.IssueText);
            return Ok(response);
        }
    }
}