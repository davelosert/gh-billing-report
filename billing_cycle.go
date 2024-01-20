package main

import (
	"fmt"
	"time"
)

type InputCycle struct {
	Year         int
	Month        int
	BillingCycle int
}

type DateRange struct {
	Start time.Time
	End   time.Time
}

const OUTPUT_FORMAT = "2006-01-02"

type BillingCycle struct {
	dateRange DateRange
}

func NewBillingCycle(inputCycle InputCycle) *BillingCycle {
	dateRange := GetRequiredDateRange(inputCycle)
	return &BillingCycle{dateRange: dateRange}
}

func (bc *BillingCycle) GetRequiredAPIDateRange() []APIDate {
	if bc.dateRange.Start.Month() == bc.dateRange.End.Month() {
		return []APIDate{ConvertDateToApiDate(bc.dateRange.Start)}
	}

	start := ConvertDateToApiDate(bc.dateRange.Start)
	end := ConvertDateToApiDate(bc.dateRange.End)
	return []APIDate{start, end}
}

func (bc *BillingCycle) GetDateRange() (time.Time, time.Time) {
	return bc.dateRange.Start, bc.dateRange.End
}

func (bc *BillingCycle) GetDateRangeAsString() string {
	start := bc.dateRange.Start.Format(OUTPUT_FORMAT)
	end := bc.dateRange.End.Format(OUTPUT_FORMAT)
	return fmt.Sprintf("%s_to_%s", start, end)
}

func (bc *BillingCycle) IsInDateRange(usageItem UsageItem) bool {
	usageItemDate, _ := time.Parse(time.RFC3339, usageItem.Date)
	return (usageItemDate.After(bc.dateRange.Start) || usageItemDate.Equal(bc.dateRange.Start)) && (usageItemDate.Before(bc.dateRange.End) ||
		usageItemDate.Equal(bc.dateRange.End))
}

func ConvertDateToApiDate(date time.Time) APIDate {
	return APIDate{
		Year:  date.Year(),
		Month: int(date.Month()),
	}
}

func GetRequiredDateRange(inputCycle InputCycle) DateRange {
	if inputCycle.BillingCycle == 1 {
		startOfMonth := startOfMonth(inputCycle.Year, inputCycle.Month)
		endOfMonth := endOfMonth(inputCycle.Year, inputCycle.Month)
		return DateRange{Start: startOfMonth, End: endOfMonth}
	}

	if !isExists(inputCycle.Year, inputCycle.Month, inputCycle.BillingCycle) {
		start := startOfMonth(inputCycle.Year, inputCycle.Month+1)
		end := endOfDay(inputCycle.Year, inputCycle.Month+1, inputCycle.BillingCycle-1)
		return DateRange{Start: start, End: end}
	}

	start := startOfDay(inputCycle.Year, inputCycle.Month, inputCycle.BillingCycle)
	end := endOfDay(inputCycle.Year, inputCycle.Month+1, inputCycle.BillingCycle-1)
	return DateRange{Start: start, End: end}
}

func endOfDay(year, month, day int) time.Time {
	return time.Date(year, time.Month(month), day, 23, 59, 59, 0, time.UTC)
}

func startOfDay(year, month, day int) time.Time {
	return time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
}

func endOfMonth(year int, month int) time.Time {
	firstOfMonth := endOfDay(year, month, 1)
	return firstOfMonth.AddDate(0, 1, -1)
}

func startOfMonth(year, month int) time.Time {
	return time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
}

func isExists(year int, month int, day int) bool {
	t := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
	return t.Day() == day
}
