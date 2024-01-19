import ExcelJS from 'exceljs';
import { UsageItem } from './UsageItem.js';
import { createOrganizationReport } from './OrganizationReport.js';

const generateExcel = async (outputFile: string, usageItems: UsageItem[]) => {
	const workbook = new ExcelJS.Workbook();
	const orgWorksheet = workbook.addWorksheet('Usage by Organization');
	
	const organizationReport = createOrganizationReport(usageItems);
	
	orgWorksheet.columns = [	
			{ header: 'Organization', key: 'organization', width: 30 },
			{ header: 'Gross Amount', key: 'grossAmount', width: 20 },
			{ header: 'Discount Amount', key: 'discountAmount', width: 20},
			{ header: 'Net Amount (actually billed)', key: 'netAmount', width: 30 },
	]
	
	orgWorksheet.getRow(1).font = { bold: true, underline: true };

	orgWorksheet.getColumn('netAmount').numFmt = '$#,##0.00;[Red]-$#,##0.00';
	orgWorksheet.getColumn('grossAmount').numFmt = '$#,##0.00;[Red]-$#,##0.00';

	orgWorksheet.addRows(organizationReport.usageByOrg)
	
	const sumRow = orgWorksheet.addRow(['Total', organizationReport.sumUsage.netAmount, organizationReport.sumUsage.grossAmount]);
	sumRow.font = { bold: true };

	console.log(`Overall Usage: ${organizationReport.sumUsage.netAmount} (net) ${organizationReport.sumUsage.grossAmount} (gross)`);

	const detailUsage = workbook.addWorksheet('Detail Usage');
	// write all the entries of the usageItems array to the excel file
	detailUsage.columns = [
		{ header: 'Date', key: 'date' },
		{ header: 'Product', key: 'product' },
		{ header: 'SKU', key: 'sku' },
		{ header: 'Quantity', key: 'quantity' },
		{ header: 'Unit Type', key: 'unitType' },
		{ header: 'Price Per Unit', key: 'pricePerUnit' },
		{ header: 'Gross Amount', key: 'grossAmount' },
		{ header: 'Discount Amount', key: 'discountAmount' },
		{ header: 'Net Amount', key: 'netAmount' },
		{ header: 'Organization Name', key: 'organizationName' },
		{ header: 'Repository Name', key: 'repositoryName' },
	];

	detailUsage.addRows(usageItems);
	console.log(`Writing to ${outputFile}`);
	await workbook.xlsx.writeFile(outputFile);
};

export {
	generateExcel
}
