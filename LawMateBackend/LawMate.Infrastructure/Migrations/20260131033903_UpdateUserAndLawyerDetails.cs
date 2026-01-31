using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawMate.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateUserAndLawyerDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                table: "USER_DETAIL",
                newName: "ContactNumber");

            migrationBuilder.AddColumn<int>(
                name: "Gender",
                table: "USER_DETAIL",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Prefix",
                table: "USER_DETAIL",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "AreaOfPractice",
                table: "LAWYER_DETAILS",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "BarAssociationMembership",
                table: "LAWYER_DETAILS",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "EnrollmentCertificate",
                table: "LAWYER_DETAILS",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "NICBackImage",
                table: "LAWYER_DETAILS",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "NICFrontImage",
                table: "LAWYER_DETAILS",
                type: "varbinary(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OfficeContactNumber",
                table: "LAWYER_DETAILS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfessionalDesignation",
                table: "LAWYER_DETAILS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectedReason",
                table: "LAWYER_DETAILS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SCECertificateNo",
                table: "LAWYER_DETAILS",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WorkingDistrict",
                table: "LAWYER_DETAILS",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Gender",
                table: "USER_DETAIL");

            migrationBuilder.DropColumn(
                name: "Prefix",
                table: "USER_DETAIL");

            migrationBuilder.DropColumn(
                name: "AreaOfPractice",
                table: "LAWYER_DETAILS");

            migrationBuilder.DropColumn(
                name: "BarAssociationMembership",
                table: "LAWYER_DETAILS");

            migrationBuilder.DropColumn(
                name: "EnrollmentCertificate",
                table: "LAWYER_DETAILS");

            migrationBuilder.DropColumn(
                name: "NICBackImage",
                table: "LAWYER_DETAILS");

            migrationBuilder.DropColumn(
                name: "NICFrontImage",
                table: "LAWYER_DETAILS");

            migrationBuilder.DropColumn(
                name: "OfficeContactNumber",
                table: "LAWYER_DETAILS");

            migrationBuilder.DropColumn(
                name: "ProfessionalDesignation",
                table: "LAWYER_DETAILS");

            migrationBuilder.DropColumn(
                name: "RejectedReason",
                table: "LAWYER_DETAILS");

            migrationBuilder.DropColumn(
                name: "SCECertificateNo",
                table: "LAWYER_DETAILS");

            migrationBuilder.DropColumn(
                name: "WorkingDistrict",
                table: "LAWYER_DETAILS");

            migrationBuilder.RenameColumn(
                name: "ContactNumber",
                table: "USER_DETAIL",
                newName: "PhoneNumber");
        }
    }
}
