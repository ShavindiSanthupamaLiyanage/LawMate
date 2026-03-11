using Microsoft.AspNetCore.Mvc;
using LawMate.API.Model.Chatbot;

namespace LawMate.API.Controllers.Common
{
    [ApiController]
    [Route("api/chatbot")]
    public class ChatbotController : ControllerBase
    {
        [HttpPost("classify")]
        public IActionResult ClassifyIssue([FromBody] ChatbotClassificationRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.IssueText))
            {
                return BadRequest(new { message = "IssueText is required." });
            }

            var response = new ChatbotClassificationResponse
            {
                SuggestedLawyerCategory = "Employment Law",
                ShortReason = "The issue appears related to workplace rights and unpaid salary.",
                Disclaimer = "This chatbot only helps identify the most relevant lawyer category based on the information provided. It does not provide legal advice or legal conclusions."
            };

            return Ok(response);
        }
    }
}