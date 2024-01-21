package main

type UsageItem struct {
	Date             string  `json:"date"`
	Product          string  `json:"product"`
	SKU              string  `json:"sku"`
	Quantity         float64 `json:"quantity"`
	UnitType         string  `json:"unitType"`
	PricePerUnit     float64 `json:"pricePerUnit"`
	GrossAmount      float64 `json:"grossAmount"`
	DiscountAmount   float64 `json:"discountAmount"`
	NetAmount        float64 `json:"netAmount"`
	OrganizationName string  `json:"organizationName"`
	RepositoryName   string  `json:"repositoryName"`
}

func FilterUsageItems(items []UsageItem, condition func(UsageItem) bool) []UsageItem {
	var result []UsageItem
	for _, item := range items {
		if condition(item) {
			result = append(result, item)
		}
	}
	return result
}
