type UsageItem = {
  date: string;
  product: string;
  sku: string;
  quantity: number;
  unitType: string;
  pricePerUnit: number;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  organizationName: string;
  repositoryName: string;
};

type Usage = { netAmount: number, grossAmount: number };
type OrganizationUsage = { orgUsage: { [key: string]: Usage }, sumUsage: Usage };


function sumUsageByOrganization(usageItems: UsageItem[]): OrganizationUsage {
	let overallNetAmount = 0;
	let overallGrossAmount = 0;

	const orgUsage = usageItems.reduce((acc, item) => {
		if (!acc[item.organizationName]) {
			acc[item.organizationName] = { netAmount: 0, grossAmount: 0 };
		}
		acc[item.organizationName].netAmount += item.netAmount;
		acc[item.organizationName].grossAmount += item.grossAmount;

		overallNetAmount += item.netAmount;
		overallGrossAmount += item.grossAmount;

		return acc;
	}, {} as { [key: string]: { netAmount: number, grossAmount: number } });

	return {
		orgUsage,
		sumUsage: {
			netAmount: overallNetAmount,
			grossAmount: overallGrossAmount
		}
	};
}

export {
	sumUsageByOrganization
}

export type {
	UsageItem,
	OrganizationUsage
}
