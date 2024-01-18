import { Octokit } from "@octokit/core";
import { UsageItem } from './UsageItem.js';

type APIDate = {
	year: number;
	month: number;
}

type EnterpriseBillingResponse = {
	data: {
		usageItems: UsageItem[];
	}
};

function createEnterpriseBillingAPI(octokit: Octokit) {
	return {
		async getUsageItemsForDates(enterprise: string, dateRanges: APIDate[]): Promise<UsageItem[]> {
			let usageItems: UsageItem[] = [];

			for(const dateRange of dateRanges) {
				const response = await octokit.request('GET /enterprises/{enterprise}/settings/billing/usage?year{year}&month={month}', {
					enterprise: enterprise,
					year: dateRange.year,
					month: dateRange.month,
					headers: {
						'X-GitHub-Api-Version': '2022-11-28'
					}
				}) as EnterpriseBillingResponse;
				usageItems = [
					...usageItems,
					...response.data.usageItems
				]
			}
			
			return usageItems;
		}
	}
}

export {
	createEnterpriseBillingAPI
};

export type {
	APIDate
};
