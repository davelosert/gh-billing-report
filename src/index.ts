import { Octokit } from "octokit";
import { Command, Option, InvalidArgumentError } from '@commander-js/extra-typings';
import { generateExcel } from './ExcelOutput.js';
import { parseInputCycle } from './InputCycle.js';
import path from 'path';
import { promises as fs } from 'fs';
import { createEnterpriseBillingAPI } from './EnterpriseBillingAPI.js';

const program = new Command()
	.addOption(
		new Option('--github-token <github-token>', 'Github token').env('GITHUB_TOKEN')
	)
	.requiredOption('--enterprise <enterprise>', 'Enterprise name')
	.addOption(
		new Option('--year <year>', 'Specify the year, e.g. 2024').default(new Date().getFullYear())
	)
	.addOption(
		new Option('--month <month>', 'Specify the month, e.g. 1').default(new Date().getMonth() + 1)
	)
	.addOption(
		new Option('--billing-cycle <billing-cycle>', 'First day of your billing cycle, e.g. 15').default(1)
	)
	.addOption(
		new Option('--report-path <report-path>', 'Path where the Excel-File will be generated (path will be generated recursively if it does not exist)').default('./reports')
	)
	
async	function start() {
	program.parse();
	const options = program.opts();


	if(!options.githubToken) {
		throw new Error('Github token is required');
	}

	const billingCycleOptions = {
		billingCycle: Number.parseInt(options.billingCycle as string),
		year: Number.parseInt(options.year as string),
		month: Number.parseInt(options.month as string)
	}

	console.log(`Recieved Billing-Cycle-Options: ${JSON.stringify(billingCycleOptions, null, 2)}`);

	const billingCycle = parseInputCycle(billingCycleOptions);

	console.log(`Getting usage for ${billingCycle.getDateRangeAsString()}`);

	const octokit = new Octokit({ auth: options.githubToken });
	const enterpriseBillingAPI = createEnterpriseBillingAPI(octokit);
	const allUsageItems = await enterpriseBillingAPI.getUsageItemsForDates(
		options.enterprise, 
		billingCycle.getRequiredAPIDateRange()
	);
	console.log(`Got ${allUsageItems.length} usage items`);

	const usageItemsInDateRange = allUsageItems.filter(billingCycle.isInDateRange);
	console.log(`Got ${usageItemsInDateRange.length} items in billing cycle.`);

	await fs.mkdir(options.reportPath, { recursive: true });
	const excelFileName = path.join(options.reportPath, `GitHub_Usage_${billingCycle.getDateRangeAsString()}.xlsx`)
	await generateExcel(excelFileName, usageItemsInDateRange);
}

start().catch(e => {
	if(e instanceof InvalidArgumentError) {
		console.error(e.message);
		process.exit(1);
	}

	console.error(e);
	process.exit(1);
});
