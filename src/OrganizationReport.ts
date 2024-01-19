import { UsageItem } from './UsageItem';

type Usage = { 
	netAmount: number
	grossAmount: number
	discountAmount: number
};
type OrgUsage = Usage & {
	organization: string;
}

type OrganizationReport = { 
	usageByOrg: OrgUsage[], sumUsage: Usage 
	usageItems: UsageItem[]
};

function createOrganizationReport(usageItems: UsageItem[]): OrganizationReport {
	let overallUsage: Usage = {
		netAmount: 0,
		grossAmount: 0,
		discountAmount: 0
	};

	const sumByOrgs = usageItems.reduce((acc, item) => {
		if (!acc[item.organizationName]) {
			acc[item.organizationName] = { 
				netAmount: 0, 
				grossAmount: 0, 
				discountAmount: 0
			};
		}
		acc[item.organizationName].netAmount += item.netAmount;
		acc[item.organizationName].grossAmount += item.grossAmount;
		acc[item.organizationName].discountAmount += item.discountAmount;

		overallUsage.netAmount += item.netAmount;
		overallUsage.grossAmount += item.grossAmount;
		overallUsage.discountAmount += item.discountAmount;

		return acc;
	}, {} as { [key: string]: Usage });

	const orgUsage: OrgUsage[] = Object.entries(sumByOrgs)
		.map(([organization, usage]) => ({
			organization,
			...usage
		})).sort((a, b) => b.netAmount - a.netAmount);

	return {
		usageByOrg: orgUsage,
		sumUsage: overallUsage,
		usageItems
	};
}

export {
	createOrganizationReport
};
