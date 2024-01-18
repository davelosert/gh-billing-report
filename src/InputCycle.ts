import { APIDate } from './EnterpriseBillingAPI';

type InputCycle = {
	year: number;
	month: number;
	billingCycle: number;
}

type DateRange = {
	start: APIDate;
	end?: APIDate;
}

function parseInputCycle({ year, month, billingCycle }: InputCycle) {
	const dateRange = getRequiredDateRange({ year, month, billingCycle });
	return {
		getRequiredAPIDateRange() {
			// Return it as Array, so we can easily iterate over it in the API
			return Object.values(dateRange);
		},
	}
}

function getRequiredDateRange({ year, month, billingCycle }: InputCycle): DateRange {
			if(billingCycle === 1) {
				return {
					start: { year, month }
				}
			} 
			
			
			// If first of the year, we need to get december from the previous year
			if(month === 1) {
				return { 
					start: { year: year - 1, month: 12 },
					end: { year, month }
				}
			}
			
			// In all other cases, we require the given and the next month
			return {
				start: { year, month },
				end: { year, month: month + 1 }
			}
}

export {
	parseInputCycle
}

export type {
	InputCycle,
	APIDate,
	DateRange
}
