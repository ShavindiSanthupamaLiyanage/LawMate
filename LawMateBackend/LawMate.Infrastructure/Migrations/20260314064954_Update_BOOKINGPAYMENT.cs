using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawMate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Update_BOOKINGPAYMENT : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "BOOKING_PAYMENT",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "LawyerFee",
                table: "BOOKING_PAYMENT",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "LawyerId",
                table: "BOOKING_PAYMENT",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PlatformCommission",
                table: "BOOKING_PAYMENT",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SlipNumber",
                table: "BOOKING_PAYMENT",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "BOOKING_PAYMENT");

            migrationBuilder.DropColumn(
                name: "LawyerFee",
                table: "BOOKING_PAYMENT");

            migrationBuilder.DropColumn(
                name: "LawyerId",
                table: "BOOKING_PAYMENT");

            migrationBuilder.DropColumn(
                name: "PlatformCommission",
                table: "BOOKING_PAYMENT");

            migrationBuilder.DropColumn(
                name: "SlipNumber",
                table: "BOOKING_PAYMENT");
        }
    }
}
