namespace LawMate.API.Model.Chatbot
{
    public class ChatbotClassificationResponse
    {
        public string SuggestedLawyerCategory { get; set; } = string.Empty;
        public string ShortReason { get; set; } = string.Empty;
        public string Disclaimer { get; set; } = string.Empty;
        public bool IsSmallTalk { get; set; } = false;
        public bool ShowCategoryCard { get; set; } = true;
        public string AssistantMessage { get; set; } = string.Empty;
    }
}