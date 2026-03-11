namespace LawMate.API.Model.Chatbot
{
    public class ChatbotClassificationResponse
    {
        public string SuggestedLawyerCategory { get; set; } = string.Empty;
        public string ShortReason { get; set; } = string.Empty;
        public string Disclaimer { get; set; } = string.Empty;
    }
}