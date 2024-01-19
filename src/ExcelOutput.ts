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
			{ header: 'Applied Discount', key: 'discountAmount', width: 22 },
			{ header: 'Net Amount (actually billed)', key: 'netAmount', width: 40 },
	]


	const grossCol = orgWorksheet.getColumn('grossAmount');
	grossCol.numFmt = '$#,##0.00;[Red]-$#,##0.00';
	grossCol.font = { color: { argb: '808080' } };

	const discountCol = orgWorksheet.getColumn('discountAmount');
	discountCol.numFmt = '$#,##0.00;[Red]-$#,##0.00';
	discountCol.font = { color: { argb: '808080' } };

	const netCol = orgWorksheet.getColumn('netAmount')
	netCol.numFmt = '$#,##0.00;[Red]-$#,##0.00';

	orgWorksheet.addRows(organizationReport.usageByOrg)

	const sumRow = orgWorksheet.addRow(['Total', organizationReport.sumUsage.grossAmount, organizationReport.sumUsage.discountAmount, organizationReport.sumUsage.netAmount]);
	sumRow.font = { bold: true };

	// Overwrite fonts for first row AFTER applying column styling
	const firstRow = orgWorksheet.getRow(1);
	firstRow.font = { bold: true, underline: true, size: 16 };
	firstRow.getCell(1).alignment = { horizontal: 'left' };
	firstRow.getCell(2).alignment = { horizontal: 'right' };
	firstRow.getCell(3).alignment = { horizontal: 'right' };
	firstRow.getCell(4).alignment = { horizontal: 'right' };

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
