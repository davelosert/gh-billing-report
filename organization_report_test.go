package main

import (
	"reflect"
	"testing"
)

func TestNewOrganizationReport(t *testing.T) {
	usageItems := []UsageItem{
		{
			OrganizationName: "Org1",
			NetAmount:        100,
			GrossAmount:      120,
			DiscountAmount:   20,
		},
		{
			OrganizationName: "Org2",
			NetAmount:        200,
			GrossAmount:      240,
			DiscountAmount:   40,
		},
		{
			OrganizationName: "Org1",
			NetAmount:        150,
			GrossAmount:      180,
			DiscountAmount:   30,
		},
	}

	expectedUsageByOrg := []OrgUsage{
		{
			Usage:        Usage{NetAmount: 250, GrossAmount: 300, DiscountAmount: 50},
			Organization: "Org1",
		},
		{
			Usage:        Usage{NetAmount: 200, GrossAmount: 240, DiscountAmount: 40},
			Organization: "Org2",
		},
	}

	expectedSumUsage := Usage{NetAmount: 450, GrossAmount: 540, DiscountAmount: 90}

	report := NewOrganizationReport(usageItems)

	if !reflect.DeepEqual(report.UsageByOrg, expectedUsageByOrg) {
		t.Errorf("Expected UsageByOrg to be %v, but got %v", expectedUsageByOrg, report.UsageByOrg)
	}

	if !reflect.DeepEqual(report.SumUsage, expectedSumUsage) {
		t.Errorf("Expected SumUsage to be %v, but got %v", expectedSumUsage, report.SumUsage)
	}

	if !reflect.DeepEqual(report.UsageItems, usageItems) {
		t.Errorf("Expected UsageItems to be %v, but got %v", usageItems, report.UsageItems)
	}
}

func TestNewOrganizationReportWithOneEmptyOrgName(t *testing.T) {
	// Define usage items
	usageItems := []UsageItem{
		{
			OrganizationName: "",
			NetAmount:        100,
			GrossAmount:      120,
			DiscountAmount:   20,
		},
		{
			OrganizationName: "",
			NetAmount:        50,
			GrossAmount:      80,
			DiscountAmount:   20,
		},
		{
			OrganizationName: "Org2",
			NetAmount:        200,
			GrossAmount:      240,
			DiscountAmount:   40,
		},
	}

	// Generate report
	report := NewOrganizationReport(usageItems)

	// Define expected report
	expectedUsageByOrg := []OrgUsage{
		{
			Usage:        Usage{NetAmount: 200, GrossAmount: 240, DiscountAmount: 40},
			Organization: "Org2",
		},
		{
			Usage:        Usage{NetAmount: 150, GrossAmount: 200, DiscountAmount: 40},
			Organization: "",
		},
	}

	expectedSumUsage := Usage{NetAmount: 350, GrossAmount: 440, DiscountAmount: 80}

	// Compare the generated report with the expected report
	if !reflect.DeepEqual(report.UsageByOrg, expectedUsageByOrg) {
		t.Errorf("Expected UsageByOrg to be %v, but got %v", expectedUsageByOrg, report.UsageByOrg)
	}

	if !reflect.DeepEqual(report.SumUsage, expectedSumUsage) {
		t.Errorf("Expected SumUsage to be %v, but got %v", expectedSumUsage, report.SumUsage)
	}
}
