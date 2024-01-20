package main

import (
	"reflect"
	"testing"
	"time"
)

func TestBillingCycle_GetDateRange(t *testing.T) {
	tests := []struct {
		name          string
		input         InputCycle
		expectedStart string
		expectedEnd   string
	}{
		{
			name:          "if billing cycle is 1, returns the start and end of the given month",
			input:         InputCycle{Year: 2022, Month: 5, BillingCycle: 1},
			expectedStart: "2022-05-01T00:00:00Z",
			expectedEnd:   "2022-05-31T23:59:59Z",
		},
		{
			name:          "if billing cycle is > 1, creates a date range from the given month and the end of the previous day of the next month",
			input:         InputCycle{Year: 2022, Month: 5, BillingCycle: 2},
			expectedStart: "2022-05-02T00:00:00Z",
			expectedEnd:   "2022-06-01T23:59:59Z",
		},
		{
			name:          "handles billing dates for months that do not contain the billing cycle date by having the first of the next month as start date",
			input:         InputCycle{Year: 2024, Month: 2, BillingCycle: 29},
			expectedStart: "2024-02-29T00:00:00Z",
			expectedEnd:   "2024-03-28T23:59:59Z",
		},
		{
			name:          "handles a billing date of 30 correct in February",
			input:         InputCycle{Year: 2024, Month: 2, BillingCycle: 30},
			expectedStart: "2024-03-01T00:00:00Z",
			expectedEnd:   "2024-03-29T23:59:59Z",
		},
		{
			name:          "handles leap years correctly when billing date is not 29",
			input:         InputCycle{Year: 2024, Month: 2, BillingCycle: 3},
			expectedStart: "2024-02-03T00:00:00Z",
			expectedEnd:   "2024-03-02T23:59:59Z",
		},
		{
			name:          "handles leap years correctly when billing date is 29",
			input:         InputCycle{Year: 2024, Month: 2, BillingCycle: 29},
			expectedStart: "2024-02-29T00:00:00Z",
			expectedEnd:   "2024-03-28T23:59:59Z",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			bc := NewBillingCycle(tt.input)
			resultStart, resultEnd := bc.GetDateRange()

			expectedStart, _ := time.Parse(time.RFC3339, tt.expectedStart)
			expectedEnd, _ := time.Parse(time.RFC3339, tt.expectedEnd)

			if !resultStart.Equal(expectedStart) || !resultEnd.Equal(expectedEnd) {
				t.Errorf("Expected\n start: %v, end: %v, but got\n start: %v, end: %v", expectedStart, expectedEnd, resultStart, resultEnd)
			}
		})
	}
}

func TestGetRequiredAPIDateRange(t *testing.T) {
	tests := []struct {
		name     string
		input    InputCycle
		expected []APIDate
	}{
		{
			name:  "if billing cycle is 1, returns only the given year and month",
			input: InputCycle{Year: 2022, Month: 5, BillingCycle: 1},
			expected: []APIDate{
				{Year: 2022, Month: 5},
			},
		},
		{
			name:  "if billing cycle is > 1, returns the given and the next month",
			input: InputCycle{Year: 2022, Month: 5, BillingCycle: 2},
			expected: []APIDate{
				{Year: 2022, Month: 5},
				{Year: 2022, Month: 6},
			},
		},
		{
			name:  "if billing cycle is > 1 and month is 12, returns the first month of the next year",
			input: InputCycle{Year: 2021, Month: 12, BillingCycle: 2},
			expected: []APIDate{
				{Year: 2021, Month: 12},
				{Year: 2022, Month: 1},
			},
		},
		{
			name:  "if billing cycle day is 31 and month is 2 (February), only returns March",
			input: InputCycle{Year: 2024, Month: 2, BillingCycle: 31},
			expected: []APIDate{
				{Year: 2024, Month: 3},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			bc := NewBillingCycle(tt.input)
			result := bc.GetRequiredAPIDateRange()
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("Expected %v, but got %v", tt.expected, result)
			}
		})
	}
}

func TestIsInDateRange(t *testing.T) {
	tests := []struct {
		name      string
		usageItem UsageItem
		input     InputCycle
		expected  bool
	}{
		{
			name:      "if billing cycle is 1 and usageItem is in same month, return true",
			usageItem: UsageItem{Date: "2022-05-15T00:00:00Z"},
			input:     InputCycle{Year: 2022, Month: 5, BillingCycle: 1},
			expected:  true,
		},
		{
			name:      "if billing cycle is 1 and usageItem is in different month, return false",
			usageItem: UsageItem{Date: "2022-06-01T00:00:00Z"},
			input:     InputCycle{Year: 2022, Month: 5, BillingCycle: 1},
			expected:  false,
		},
		{
			name:      "if billing cycle is > 1 and usageItem is within the same month, return true",
			usageItem: UsageItem{Date: "2022-05-15T00:00:00Z"},
			input:     InputCycle{Year: 2022, Month: 5, BillingCycle: 2},
			expected:  true,
		},
		{
			name:      "usage item is exactly at start of billing cycle, return true",
			usageItem: UsageItem{Date: "2022-05-02T00:00:00Z"},
			input:     InputCycle{Year: 2022, Month: 5, BillingCycle: 2},
			expected:  true,
		},
		{
			name:      "usage item is exactly at end of billing cycle, return true",
			usageItem: UsageItem{Date: "2022-06-01T23:59:59Z"},
			input:     InputCycle{Year: 2022, Month: 5, BillingCycle: 2},
			expected:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			bc := NewBillingCycle(tt.input)
			result := bc.IsInDateRange(tt.usageItem)
			if result != tt.expected {
				t.Errorf("Expected %v for UsageItem.Date %v to be in range of input-cycle %v, but got %v", tt.expected, tt.usageItem.Date, tt.input, result)
			}
		})
	}
}
