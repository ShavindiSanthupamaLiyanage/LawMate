using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawMate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserDetailsWithIsDualAccountColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDualAccount",
                table: "USER_DETAIL",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDualAccount",
                table: "USER_DETAIL");
        }
    }
}
