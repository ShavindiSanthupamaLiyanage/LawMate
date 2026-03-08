namespace LawMate.Domain.DTOs
{
    public class ArticleDto
    {
        public int ArticleId { get; set; }
        public string LawyerId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string LegalCategory { get; set; }
        public string Language { get; set; }
        public bool IsPublished { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        
    }
}