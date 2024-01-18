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

type EnterpriseBillingResponse = {
	data: {
		usageItems: UsageItem[];
	}
};

function sumUsageByOrganization(usageItems: UsageItem[]): { [key: string]: { netAmount: number, grossAmount: number } } {
  return usageItems.reduce((acc, item) => {
    if (!acc[item.organizationName]) {
      acc[item.organizationName] = { netAmount: 0, grossAmount: 0 };
    }
    acc[item.organizationName].netAmount += item.netAmount;
    acc[item.organizationName].grossAmount += item.grossAmount;
    return acc;
  }, {} as { [key: string]: { netAmount: number, grossAmount: number } });
}

export {
	sumUsageByOrganization
}

export type {
	EnterpriseBillingResponse,
	UsageItem 
}
