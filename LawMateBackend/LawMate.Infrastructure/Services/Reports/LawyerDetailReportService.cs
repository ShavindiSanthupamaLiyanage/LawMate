using ClosedXML.Excel;
using LawMate.Application.AdminModule.AdminReports.Queries;
using LawMate.Application.Common.Interfaces.AdminReports;
using LawMate.Domain.DTOs;
using MediatR;

namespace LawMate.Infrastructure.Services.Reports
{
    public class LawyerDetailReportService : ILawyerDetailReportService
    {
        private readonly IMediator _mediator;

        public LawyerDetailReportService(IMediator mediator)
        {
            _mediator = mediator;
        }

        // Column definitions (order matters — drives header row and data mapping) 
        private static readonly (string Header, Func<LawyerDetailReportDto, object?> Value)[] Columns =
        [
            ("User ID",                    r => r.UserId),
            ("Prefix",                     r => r.Prefix),
            ("First Name",                 r => r.FirstName),
            ("Last Name",                  r => r.LastName),
            ("Email",                      r => r.Email),
            ("Contact Number",             r => r.ContactNumber),
            ("Gender",                     r => r.Gender),
            ("NIC",                        r => r.NIC),
            ("Registration Date",          r => r.RegistrationDate?.ToString("yyyy-MM-dd") ?? "-"),
            ("Last Login Date",            r => r.LastLoginDate?.ToString("yyyy-MM-dd") ?? "-"),
            ("State",                      r => r.State),
            ("SCE Certificate No",         r => r.SCECertificateNo),
            ("Bio",                        r => r.Bio),
            ("Professional Designation",   r => r.ProfessionalDesignation),
            ("Years of Experience",        r => r.YearOfExperience),
            ("Working District",           r => r.WorkingDistrict),
            ("Area of Practice",           r => r.AreaOfPractice),
            ("Office Contact Number",      r => r.OfficeContactNumber),
            ("Bar Association Membership", r => r.BarAssociationMembership),
            ("Bar Association Reg. No",    r => r.BarAssociationRegNo),
            ("Average Rating",             r => r.AverageRating),
            ("Verification Status",        r => r.VerificationStatus),
            ("Verified At",                r => r.VerifiedAt?.ToString("yyyy-MM-dd") ?? "-"),
            ("Verified By",                r => r.VerifiedBy),
            ("Rejected Reason",            r => r.RejectedReason),
            ("Membership Start Date",      r => r.MembershipStartDate?.ToString("yyyy-MM-dd") ?? "-"),
            ("Membership End Date",        r => r.MembershipEndDate?.ToString("yyyy-MM-dd") ?? "-"),
            ("Membership Expired",         r => r.MembershipExpired.HasValue
                                                    ? (r.MembershipExpired.Value ? "Yes" : "No")
                                                    : "-"),
        ];

        public async Task<byte[]> GenerateLawyerDetailReportAsync(string generatedByUserId)
        {
            // 1. Fetch data via MediatR query
            var data = (await _mediator.Send(new GetLawyerDetailReportQuery())).ToList();

            int totalCols = Columns.Length;

            using var workbook  = new XLWorkbook();
            var sheet = workbook.Worksheets.Add("Lawyer Detail Report");

            // META HEADER (rows 1-4) 
            WriteMetaHeader(sheet, generatedByUserId, totalCols);

            // COLUMN HEADERS (row 6) 
            const int headerRow = 6;
            WriteColumnHeaders(sheet, headerRow, totalCols);

            // DATA ROWS (row 7 onwards) 
            int currentRow = headerRow + 1;
            foreach (var row in data)
            {
                for (int col = 1; col <= totalCols; col++)
                {
                    var cell = sheet.Cell(currentRow, col);
                    cell.Value = XLCellValue.FromObject(Columns[col - 1].Value(row));

                    // Subtle alternating row shading
                    if (currentRow % 2 == 0)
                        cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#F7F7F7");
                }
                currentRow++;
            }

            // COLUMN WIDTHS 
            sheet.ColumnsUsed().AdjustToContents(minWidth: 12, maxWidth: 50);

            // Freeze pane: keep meta header + column header visible while scrolling
            sheet.SheetView.FreezeRows(headerRow);

            // WRITE TO BYTES
            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            return ms.ToArray();
        }
        
        private static void WriteMetaHeader(IXLWorksheet sheet, string userId, int totalCols)
        {
            // Row 1 – Report title
            var titleCell = sheet.Cell(1, 1);
            titleCell.Value = "Lawyer Detail Report";
            titleCell.Style.Font.Bold      = true;
            titleCell.Style.Font.FontSize  = 16;
            titleCell.Style.Font.FontColor = XLColor.FromHtml("#1B3A6B");   // dark navy
            titleCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            sheet.Range(1, 1, 1, totalCols).Merge();

            // Row 2 – Brand name
            var brandCell = sheet.Cell(2, 1);
            brandCell.Value = "LawMate";
            brandCell.Style.Font.Bold      = true;
            brandCell.Style.Font.FontSize  = 12;
            brandCell.Style.Font.FontColor = XLColor.FromHtml("#4A6FA5");
            brandCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            sheet.Range(2, 1, 2, totalCols).Merge();

            // Row 3 – Generated date/time
            var dateCell = sheet.Cell(3, 1);
            dateCell.Value = $"Generated Date/Time : {DateTime.Now:yyyy-MM-dd  HH:mm:ss}";
            dateCell.Style.Font.FontSize  = 10;
            dateCell.Style.Font.Italic    = true;
            dateCell.Style.Font.FontColor = XLColor.FromHtml("#555555");
            dateCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            sheet.Range(3, 1, 3, totalCols).Merge();

            // Row 4 – Generated by
            var userCell = sheet.Cell(4, 1);
            userCell.Value = $"Generated By       : {userId}";
            userCell.Style.Font.FontSize  = 10;
            userCell.Style.Font.Italic    = true;
            userCell.Style.Font.FontColor = XLColor.FromHtml("#555555");
            userCell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            sheet.Range(4, 1, 4, totalCols).Merge();

            // Row 5 – Blank spacer (leave it empty, just ensure height)
            sheet.Row(5).Height = 6;
        }

        private static void WriteColumnHeaders(IXLWorksheet sheet, int headerRow, int totalCols)
        {
            for (int col = 1; col <= totalCols; col++)
            {
                var cell = sheet.Cell(headerRow, col);
                cell.Value = Columns[col - 1].Header;

                cell.Style.Font.Bold      = true;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Font.FontSize  = 10;
                cell.Style.Fill.BackgroundColor      = XLColor.FromHtml("#1B3A6B");
                cell.Style.Alignment.Horizontal      = XLAlignmentHorizontalValues.Center;
                cell.Style.Alignment.Vertical        = XLAlignmentVerticalValues.Center;
                cell.Style.Alignment.WrapText        = true;
                cell.Style.Border.OutsideBorder      = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = XLColor.FromHtml("#AAAAAA");
            }

            sheet.Row(headerRow).Height = 30;
        }

        // private static void WriteTotalsRow(IXLWorksheet sheet, int headerRow, int totalsRow, int totalCols)
        // {
        //     // Identify column indices (1-based) for numeric totals
        //     int totalBookingsCol     = Array.FindIndex(Columns, c => c.Header == "Total Bookings")     + 1;
        //     int completedBookingsCol = Array.FindIndex(Columns, c => c.Header == "Completed Bookings") + 1;
        //     int totalEarningsCol     = Array.FindIndex(Columns, c => c.Header == "Total Earnings (LKR)") + 1;
        //
        //     int dataStartRow = headerRow + 1;
        //     int dataEndRow   = totalsRow - 1;
        //
        //     // Label cell
        //     var labelCell = sheet.Cell(totalsRow, 1);
        //     labelCell.Value = "TOTALS";
        //     labelCell.Style.Font.Bold      = true;
        //     labelCell.Style.Font.FontColor = XLColor.White;
        //     labelCell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1B3A6B");
        //
        //     // Apply label style across all columns
        //     for (int col = 1; col <= totalCols; col++)
        //     {
        //         var cell = sheet.Cell(totalsRow, col);
        //         cell.Style.Font.Bold             = true;
        //         cell.Style.Font.FontColor        = XLColor.White;
        //         cell.Style.Fill.BackgroundColor  = XLColor.FromHtml("#1B3A6B");
        //         cell.Style.Border.OutsideBorder  = XLBorderStyleValues.Thin;
        //         cell.Style.Border.OutsideBorderColor = XLColor.FromHtml("#AAAAAA");
        //     }
        //
        //     if (dataEndRow >= dataStartRow)
        //     {
        //         SetSumFormula(sheet, totalsRow, totalBookingsCol,     dataStartRow, dataEndRow);
        //         SetSumFormula(sheet, totalsRow, completedBookingsCol, dataStartRow, dataEndRow);
        //         SetSumFormula(sheet, totalsRow, totalEarningsCol,     dataStartRow, dataEndRow);
        //     }
        // }
        //
        // private static void SetSumFormula(IXLWorksheet sheet, int totalsRow, int col, int start, int end)
        // {
        //     if (col <= 0) return;
        //     var colLetter = sheet.Cell(start, col).Address.ColumnLetter;
        //     sheet.Cell(totalsRow, col).FormulaA1 = $"SUM({colLetter}{start}:{colLetter}{end})";
        // }
    }
}