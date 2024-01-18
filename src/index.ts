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

program.parse();
const options = program.opts();

if(!options.githubToken) {
	throw new Error('Github token is required');
}

const reportDateRange = parseInputCycle({
	billingCycle: options.billingCycle as number,
	year: options.year as number,
	month: options.month as number
});

console.log(`Getting usage for ${options.enterprise} for ${options.year}-${options.month}`);

const octokit = new Octokit({ auth: options.githubToken });
const enterpriseBillingAPI = createEnterpriseBillingAPI(octokit);
const usageItems = await enterpriseBillingAPI.getUsageItemsForDates(
	options.enterprise, 
	reportDateRange.getRequiredAPIDateRange()
);

console.log(`Got ${usageItems.length} usage items`);

const excelFilePath = path.join(process.cwd(), 'output');
await fs.mkdir(excelFilePath, { recursive: true });
const excelFileName = path.join(excelFilePath, `usage-${options.enterprise}-${options.year}-${options.month}.xlsx`)
await generateExcel(excelFileName, usageItems)
