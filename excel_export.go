package main

import (
	"fmt"

	"github.com/xuri/excelize/v2"
)

const (
	orgSummarySheetName = "Usage by Organization"
	usageSheetName      = "Usage Details"
	// This is Dollars

	dollarFormat = 177
)

func GenerateExcel(outputFile string, organizationReport OrganizationReport) error {
	file := excelize.NewFile()
	file.SetSheetName("Sheet1", orgSummarySheetName)

	generateOrganizationSheet(file, organizationReport)
	generateUsageDetailSheet(file, organizationReport)

	// Save spreadsheet by the given path.
	err := file.SaveAs(outputFile)
	return err
}

func generateOrganizationSheet(file *excelize.File, organizationReport OrganizationReport) {
	currencyStyle, _ := file.NewStyle(&excelize.Style{NumFmt: dollarFormat})
	file.SetColStyle(orgSummarySheetName, "B:D", currencyStyle)

	// Title
	file.SetCellValue(orgSummarySheetName, "A1", "Usage by Organization")
	titleStyle, _ := file.NewStyle(&excelize.Style{Font: &excelize.Font{Bold: true, Size: 16}})
	file.SetCellStyle(orgSummarySheetName, "A1", "A1", titleStyle)
	file.MergeCell(orgSummarySheetName, "A1", "D1")

	// Organization Header
	orgHeaderStyle, _ := file.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true},
		Alignment: &excelize.Alignment{Horizontal: "left"},
	})
	file.SetCellValue(orgSummarySheetName, "A2", "Organization")
	file.SetCellStyle(orgSummarySheetName, "A2", "A2", orgHeaderStyle)
	file.SetColWidth(orgSummarySheetName, "A", "A", 30)

	// Amount Headers
	amountHeaderStyle, _ := file.NewStyle(&excelize.Style{
		Font:      &excelize.Font{Bold: true},
		Alignment: &excelize.Alignment{Horizontal: "right"},
	})
	file.SetCellStyle(orgSummarySheetName, "B2", "D2", amountHeaderStyle)
	file.SetCellValue(orgSummarySheetName, "B2", "Gross Amount")
	file.SetColWidth(orgSummarySheetName, "B", "B", 15)
	file.SetCellValue(orgSummarySheetName, "C2", "Applied Discount")
	file.SetColWidth(orgSummarySheetName, "C", "C", 15)
	file.SetCellValue(orgSummarySheetName, "D2", "Net Amount (actually billed)")
	file.SetColWidth(orgSummarySheetName, "D", "D", 30)

	// Add rows with organizationReport.usageByOrg
	for i, item := range organizationReport.UsageByOrg {
		startCell, _ := excelize.JoinCellName("A", i+3)
		file.SetSheetRow(orgSummarySheetName, startCell, &[]interface{}{item.Organization, item.GrossAmount, item.DiscountAmount * -1, item.NetAmount})
	}

	file.AddTable(orgSummarySheetName, &excelize.Table{
		Name:            "UsageByOrg",
		Range:           "A2:D" + fmt.Sprintf("%d", len(organizationReport.UsageByOrg)+3),
		StyleName:       "TableStyleMedium2",
		ShowLastColumn:  true,
		ShowFirstColumn: true,
	})

	// Add a summaryrow
	lastRowIndex := len(organizationReport.UsageByOrg) + 3
	lastRowCellRange := fmt.Sprintf("A%d", lastRowIndex)

	file.SetSheetRow(orgSummarySheetName, lastRowCellRange, &[]interface{}{"Total", organizationReport.SumUsage.GrossAmount, organizationReport.SumUsage.DiscountAmount, organizationReport.SumUsage.NetAmount})

	summaryRowStyle, _ := file.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true, Size: 14},
		Border: []excelize.Border{{
			Type:  "top",
			Color: "000000",
			Style: 6,
		}},
		NumFmt: dollarFormat,
	})
	file.SetCellStyle(orgSummarySheetName, fmt.Sprintf("A%d", lastRowIndex), fmt.Sprintf("D%d", lastRowIndex), summaryRowStyle)

}

func generateUsageDetailSheet(file *excelize.File, organizationReport OrganizationReport) {
	file.NewSheet(usageSheetName)

	headers := []string{
		"Date",              // A
		"Product",           // B
		"SKU",               // C
		"Quantity",          // D
		"Unit Type",         // E
		"Price Per Unit",    // F
		"Gross Amount",      // G
		"Discount Amount",   // H
		"Net Amount",        // I
		"Organization Name", // J
		"Repository Name",   // K
	}

	file.SetSheetRow(usageSheetName, "A1", &headers)
	file.SetColWidth(usageSheetName, "A", "A", 20)
	file.SetColWidth(usageSheetName, "B", "B", 8)
	file.SetColWidth(usageSheetName, "C", "C", 20)
	file.SetColWidth(usageSheetName, "D", "D", 12)
	file.SetColWidth(usageSheetName, "E", "E", 12)
	file.SetColWidth(usageSheetName, "F", "F", 8)
	file.SetColWidth(usageSheetName, "G", "G", 8)
	file.SetColWidth(usageSheetName, "H", "H", 8)
	file.SetColWidth(usageSheetName, "I", "I", 8)
	file.SetColWidth(usageSheetName, "J", "J", 30)
	file.SetColWidth(usageSheetName, "K", "K", 60)

	currencyStyle, _ := file.NewStyle(&excelize.Style{NumFmt: dollarFormat})
	file.SetColStyle(usageSheetName, "F:I", currencyStyle)

	for i, item := range organizationReport.UsageItems {
		startCell, _ := excelize.JoinCellName("A", i+2)
		file.SetSheetRow(usageSheetName, startCell, &[]interface{}{
			item.Date,
			item.Product,
			item.SKU,
			item.Quantity,
			item.UnitType,
			item.PricePerUnit,
			item.GrossAmount,
			item.DiscountAmount,
			item.NetAmount,
			item.OrganizationName,
			item.RepositoryName,
		})
	}

	file.AddTable(usageSheetName, &excelize.Table{
		Name:      "UsageDetails",
		Range:     "A1:K" + fmt.Sprintf("%d", len(organizationReport.UsageItems)+2),
		StyleName: "TableStyleMedium2",
	})
}
