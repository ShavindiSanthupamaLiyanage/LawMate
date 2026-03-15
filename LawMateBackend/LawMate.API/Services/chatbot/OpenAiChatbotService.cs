using System.Text.Json;
using LawMate.API.Model.Chatbot;
using Microsoft.Extensions.Configuration;
using OpenAI.Responses;

#pragma warning disable OPENAI001

namespace LawMate.API.Services.Chatbot
{
    public class OpenAiChatbotService
    {
        private readonly ResponsesClient _client;

        private static readonly HashSet<string> AllowedCategories = new(StringComparer.OrdinalIgnoreCase)
        {
            "Family Law",
            "Criminal Law",
            "Property Law",
            "Employment Law",
            "Civil Law / Civil Disputes",
            "Business / Commercial Law",
            "General Consultation",
            "Not a Legal Matter"
        };

        public OpenAiChatbotService(IConfiguration configuration)
        {
            var apiKey =
                configuration["OpenAI:ApiKey"] ??
                Environment.GetEnvironmentVariable("OPENAI_API_KEY");

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("OpenAI API key is not configured.");
            }

            _client = new ResponsesClient(apiKey);
        }

        public async Task<ChatbotClassificationResponse> ClassifyIssueAsync(string issueText)
        {
            var prompt = $"""
You are a legal issue classification assistant for a client-lawyer booking system.

Your job is only to classify the client's issue into exactly one lawyer category from this list:
- Family Law
- Criminal Law
- Property Law
- Employment Law
- Civil Law / Civil Disputes
- Business / Commercial Law
- General Consultation
- Not a Legal Matter

Rules:
- Do not provide legal advice.
- Do not provide legal conclusions.
- Do not recommend actions.
- Do not predict outcomes.
- If the issue is unclear, incomplete, or overlaps multiple legal areas, return "General Consultation".
- If the issue is not legal in nature and does not appear to require a lawyer, return "Not a Legal Matter".
- Keep the reason short, simple, and user-friendly.
- Return valid JSON only with these exact fields:
  suggested_lawyer_category
  short_reason
  disclaimer

The disclaimer must always be:
"This chatbot only helps identify the most relevant lawyer category based on the information provided. It does not provide legal advice or legal conclusions."

Client issue:
{issueText}
""";

            ResponseResult response = await _client.CreateResponseAsync(
                model: "gpt-5-mini",
                userInputText: prompt
            );

            string outputText = response.GetOutputText();

            var parsed = JsonSerializer.Deserialize<OpenAiChatbotRawResponse>(outputText);

            if (parsed == null)
            {
                throw new Exception("Failed to parse OpenAI response.");
            }

            var category = parsed.suggested_lawyer_category?.Trim() ?? "General Consultation";

            if (!AllowedCategories.Contains(category))
            {
                category = "General Consultation";
            }

            return new ChatbotClassificationResponse
            {
                SuggestedLawyerCategory = category,
                ShortReason = parsed.short_reason?.Trim()
                    ?? "The issue is unclear or may involve more than one legal area.",
                Disclaimer = parsed.disclaimer?.Trim()
                    ?? "This chatbot only helps identify the most relevant lawyer category based on the information provided. It does not provide legal advice or legal conclusions."
            };
        }

        private class OpenAiChatbotRawResponse
        {
            public string? suggested_lawyer_category { get; set; }
            public string? short_reason { get; set; }
            public string? disclaimer { get; set; }
        }
    }
}