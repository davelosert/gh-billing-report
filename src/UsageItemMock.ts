import { UsageItem } from './UsageItem.js';

const defaultUsageItem: UsageItem ={ 
      "date": "2024-01-01T00:00:00Z",
      "product": "actions",
      "sku": "Actions Storage",
      "quantity": 0.927526528,
      "unitType": "GigabyteHours",
      "pricePerUnit": 0.00033602,
      "grossAmount": 0.00031144,
      "discountAmount": 2.29e-06,
      "netAmount": 0.00030915,
      "organizationName": "MockOrgName",
      "repositoryName": "MockRepoName"
}

const createMockUsageItem = (overwrites: Partial<UsageItem> = {}) => ({
  ...defaultUsageItem,
  ...overwrites
});

export {
	createMockUsageItem
};
