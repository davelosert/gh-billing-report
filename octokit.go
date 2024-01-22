package main

import (
	"fmt"

	"github.com/cli/go-gh/v2/pkg/api"
)

type APIDate struct {
	Year  int
	Month int
}

type EnterpriseBillingResponse struct {
	UsageItems []UsageItem
}

type Octokit struct {
	client *api.RESTClient
}

func (self *Octokit) getUsageItemsForDates(enterprise string, dateRanges []APIDate) ([]UsageItem, error) {
	var usageItems []UsageItem

	for _, dateRange := range dateRanges {
		url := fmt.Sprintf("enterprises/%s/settings/billing/usage?year=%d&month=%d", enterprise, dateRange.Year, dateRange.Month)

		parsedResponse := EnterpriseBillingResponse{}
		err := self.client.Get(url, &parsedResponse)

		if err != nil {
			return nil, err
		}

		// Don't forget to close the response body
		return parsedResponse.UsageItems, nil
	}

	return usageItems, nil
}
