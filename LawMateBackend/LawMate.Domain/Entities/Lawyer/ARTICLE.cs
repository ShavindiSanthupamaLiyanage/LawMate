using System.ComponentModel.DataAnnotations;
using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.Entities.Lawyer;

public class ARTICLE
{
    [Key]
    public string ArticleId { get; set; }
    [Required]
    public string LawyerId { get; set; }
    [Required]
    public string Title { get; set; }
    public string Content { get; set; }
    public LegalCategory LegalCategory { get; set; }
    public Language Language { get; set; }
    public bool IsPublished { get; set; }                         
    [MaxLength(150)]
    public string? CreatedBy { get; set; }
    public DateTime? CreatedAt { get; set; }
    [MaxLength(150)]
    public string? ModifiedBy { get; set; }
    public DateTime? ModifiedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
}