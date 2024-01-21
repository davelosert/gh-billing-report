package main

import "sort"

type Usage struct {
	NetAmount      float64
	GrossAmount    float64
	DiscountAmount float64
}

type OrgUsage struct {
	Usage
	Organization string
}

type OrganizationReport struct {
	UsageByOrg []OrgUsage
	SumUsage   Usage
	UsageItems []UsageItem
}

func NewOrganizationReport(usageItems []UsageItem) OrganizationReport {
	overallUsage := Usage{}

	sumByOrgs := make(map[string]Usage)

	for _, item := range usageItems {
		usage := sumByOrgs[item.OrganizationName]
		usage.NetAmount += item.NetAmount
		usage.GrossAmount += item.GrossAmount
		usage.DiscountAmount += item.DiscountAmount
		sumByOrgs[item.OrganizationName] = usage

		overallUsage.NetAmount += item.NetAmount
		overallUsage.GrossAmount += item.GrossAmount
		overallUsage.DiscountAmount += item.DiscountAmount
	}

	usageByOrg := make([]OrgUsage, 0, len(sumByOrgs))
	for org, usage := range sumByOrgs {
		usageByOrg = append(usageByOrg, OrgUsage{Usage: usage, Organization: org})
	}

	sort.Slice(usageByOrg, func(i, j int) bool {
		return usageByOrg[j].NetAmount < usageByOrg[i].NetAmount
	})

	return OrganizationReport{
		UsageByOrg: usageByOrg,
		SumUsage:   overallUsage,
		UsageItems: usageItems,
	}
}
