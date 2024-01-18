import { Octokit } from "octokit";
import { Command, Option, InvalidArgumentError } from '@commander-js/extra-typings';
import { generateExcel } from './ExcelOutput.js';
import type { EnterpriseBillingResponse, UsageItem } from "./UsageItem.js";
import path from 'path';
import { promises as fs } from 'fs';

const program = new Command()
	.addOption(new Option('--github-token <github-token>', 'Github token').env('GITHUB_TOKEN'))
	.requiredOption('--enterprise <enterprise>', 'Enterprise name')
	.addOption(new Option('--year <year>', 'Specify the year, e.g. 2024').default(new Date().getFullYear()))
	.addOption(new Option('--month <month>', 'Specify the month, e.g. 1').default(new Date().getMonth() + 1))

program.parse();
const options = program.opts();

if(!options.githubToken) {
	throw new Error('Github token is required');
}

console.log(`Getting usage for ${options.enterprise} for ${options.year}-${options.month}`);

const octokit = new Octokit({ auth: options.githubToken });
const costUsage = await octokit.request('GET /enterprises/{enterprise}/settings/billing/usage?year{year}&month={month}', {
	enterprise: options.enterprise,
	year: options.year,
	month: options.month,
	headers: {
		'X-GitHub-Api-Version': '2022-11-28'
	}
}) as EnterpriseBillingResponse;

console.log(`Got ${costUsage.data.usageItems.length} usage items`);

const excelFilePath = path.join(process.cwd(), 'output');
await fs.mkdir(excelFilePath, { recursive: true });
const excelFileName = path.join(excelFilePath, `usage-${options.enterprise}-${options.year}-${options.month}.xlsx`)
await generateExcel(excelFileName, costUsage.data.usageItems)
