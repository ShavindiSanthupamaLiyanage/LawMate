using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawMate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add_ReceiptDocument_To_BOOKINGPAYMENT : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "SuspendedAt",
                table: "CLIENT_DETAILS",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SuspendedBy",
                table: "CLIENT_DETAILS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SuspendedReason",
                table: "CLIENT_DETAILS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "ReceiptDocument",
                table: "BOOKING_PAYMENT",
                type: "varbinary(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SuspendedAt",
                table: "CLIENT_DETAILS");

            migrationBuilder.DropColumn(
                name: "SuspendedBy",
                table: "CLIENT_DETAILS");

            migrationBuilder.DropColumn(
                name: "SuspendedReason",
                table: "CLIENT_DETAILS");

            migrationBuilder.DropColumn(
                name: "ReceiptDocument",
                table: "BOOKING_PAYMENT");
        }
    }
}
