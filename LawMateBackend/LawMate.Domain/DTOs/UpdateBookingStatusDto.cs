using System.ComponentModel.DataAnnotations;
using LawMate.Domain.Common.Enums;

namespace LawMate.Domain.DTOs;

public class UpdateBookingStatusDto
{
    [Required]
    public BookingStatus Status { get; set; }
    
    public string? RejectionReason { get; set; }
}
