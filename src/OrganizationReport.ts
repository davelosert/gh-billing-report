import { UsageItem } from './UsageItem';

type Usage = { netAmount: number, grossAmount: number };
type OrgUsage = Usage & {
	organization: string;
}

type OrganizationReport = { 
	usageByOrg: OrgUsage[], sumUsage: Usage 
	usageItems: UsageItem[]
};

function createOrganizationReport(usageItems: UsageItem[]): OrganizationReport {
	let overallNetAmount = 0;
	let overallGrossAmount = 0;

	const sumByOrgs = usageItems.reduce((acc, item) => {
		if (!acc[item.organizationName]) {
			acc[item.organizationName] = { netAmount: 0, grossAmount: 0 };
		}
		acc[item.organizationName].netAmount += item.netAmount;
		acc[item.organizationName].grossAmount += item.grossAmount;

		overallNetAmount += item.netAmount;
		overallGrossAmount += item.grossAmount;

		return acc;
	}, {} as { [key: string]: Usage });

	const orgUsage: OrgUsage[] = Object.entries(sumByOrgs)
		.map(([organization, { netAmount, grossAmount }]) => ({
			organization,
			netAmount,
			grossAmount
		})).sort((a, b) => b.netAmount - a.netAmount);

	return {
		usageByOrg: orgUsage,
		sumUsage: {
			netAmount: overallNetAmount,
			grossAmount: overallGrossAmount
		},
		usageItems
	};
}

export {
	createOrganizationReport
};
