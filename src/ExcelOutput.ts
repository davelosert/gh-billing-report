import ExcelJS from 'exceljs';
import { UsageItem, sumUsageByOrganization } from './UsageItem.js';

const generateExcel = async (outputFile: string, usageItems: UsageItem[]) => {
	const workbook = new ExcelJS.Workbook();
	const orgWorksheet = workbook.addWorksheet('Usage by Organization');
	
	const orgUsage = sumUsageByOrganization(usageItems);
	// write the org usage to the excel file, with one row per org and a column for net and gross amount
	orgWorksheet.addTable({
		name: 'Usage by Organization',
		ref: 'A1',
		headerRow: true,
		totalsRow: true,
		style: {
			theme: 'TableStyleMedium2',
			showRowStripes: true,
		},
		columns :[
			{ name: 'Organization', totalsRowLabel: 'Total', filterButton: false },
			{ name: 'Net Amount (with discounts applied)', totalsRowFunction: 'sum', filterButton: false},
			{ name: 'Gross Amount (without discounts)', totalsRowFunction: 'sum', filterButton: false},
		],
		rows: Object.entries(orgUsage).map(([organizationName, { netAmount, grossAmount }]) => ([
			organizationName,
			netAmount,
			grossAmount,
		]))
	})
	
	orgWorksheet.getColumn(2).numFmt
	
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
