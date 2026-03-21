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

        private static readonly HashSet<string> GreetingInputs = new(StringComparer.OrdinalIgnoreCase)
        {
            "hi",
            "hello",
            "hey",
            "good morning",
            "good afternoon",
            "good evening",
            "how are you",
            "how are you?",
            "hiya",
            "yo",
            "sup"
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
            if (string.IsNullOrWhiteSpace(issueText))
            {
                return new ChatbotClassificationResponse
                {
                    IsSmallTalk = true,
                    ShowCategoryCard = false,
                    AssistantMessage = "Hello! Please describe your legal issue in a few words, and I’ll help identify the most relevant type of lawyer.",
                    Disclaimer = string.Empty,
                    SuggestedLawyerCategory = string.Empty,
                    ShortReason = string.Empty
                };
            }

            var normalizedInput = issueText.Trim();

            if (IsGreetingOrSmallTalk(normalizedInput))
            {
                return new ChatbotClassificationResponse
                {
                    IsSmallTalk = true,
                    ShowCategoryCard = false,
                    AssistantMessage = "Hello! Please describe your legal issue, and I’ll help identify the most relevant lawyer category for you.",
                    Disclaimer = string.Empty,
                    SuggestedLawyerCategory = string.Empty,
                    ShortReason = string.Empty
                };
            }

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
                    ?? "This chatbot only helps identify the most relevant lawyer category based on the information provided. It does not provide legal advice or legal conclusions.",
                IsSmallTalk = false,
                ShowCategoryCard = true,
                AssistantMessage = string.Empty
            };
        }

        private static bool IsGreetingOrSmallTalk(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return true;

            var normalized = input.Trim().ToLowerInvariant();

            var exactMatches = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "hi",
                "hello",
                "hey",
                "good morning",
                "good afternoon",
                "good evening",
                "how are you",
                "how are you?",
                "hiya",
                "yo",
                "sup",
                "thanks",
                "thank you",
                "bye",
                "goodbye",
                "can you help me",
                "need help",
                "help me",
                "i need help",
                "what can you do",
                "who are you"
            };

            if (exactMatches.Contains(normalized))
                return true;

            var greetingKeywords = new[]
            {
                "hi",
                "hello",
                "hey",
                "good morning",
                "good afternoon",
                "good evening",
                "how are you"
            };

            foreach (var keyword in greetingKeywords)
            {
                if (normalized.Contains(keyword))
                {
                    // if message is short and mostly greeting-like, treat as small talk
                    if (normalized.Length <= 40)
                        return true;
                }
            }

            return false;
        }

        private class OpenAiChatbotRawResponse
        {
            public string? suggested_lawyer_category { get; set; }
            public string? short_reason { get; set; }
            public string? disclaimer { get; set; }
        }
    }
}