import { APIDate } from './EnterpriseBillingAPI';
import { UsageItem } from './UsageItem';
import { UTCDate } from "@date-fns/utc";
import { parseISO, isExists, Interval, isSameMonth, endOfDay, startOfMonth, endOfMonth, addMonths, subDays, isWithinInterval, format } from 'date-fns'

type InputCycle = {
	year: number;
	month: number;
	billingCycle: number;
}

type ApiDateRange = {
	start: APIDate;
	end?: APIDate;
}

const OUTPUT_FORMAT='yyyy-MM-dd';

function parseInputCycle({ year, month, billingCycle }: InputCycle) {
	const dateRange = getRequiredDateRange({ year, month, billingCycle });

	return {
		getRequiredAPIDateRange() {
			if(isSameMonth(dateRange.start, dateRange.end)) {
				return [convertDateToApiDate(dateRange.start as Date)];
			}
			// Return it as Array, so we can easily iterate over it in the API
			return [
				convertDateToApiDate(dateRange.start as Date),
				convertDateToApiDate(dateRange.end as Date)
			];
		},
		getDateRange() {
			return dateRange;
		},
		getDateRangeAsString() {
			const start = format(dateRange.start, OUTPUT_FORMAT);
			const end = format(dateRange.end as Date, OUTPUT_FORMAT);
			return `${start}_to_${end}`;
		},
		isInDateRange(usageItem: UsageItem) {
			const usageItemDate = parseISO(usageItem.date);
			return isWithinInterval(usageItemDate, dateRange);
		}
	}
}

function convertDateToApiDate(date: Date): APIDate {
	return {
		year: date.getFullYear(),
		month: date.getMonth() + 1
	}
}


function getRequiredDateRange({ year, month, billingCycle }: InputCycle): Interval {
			const normalizedMonth = month - 1;

			if(billingCycle === 1) {
				return {
					start: startOfMonth(new UTCDate(year, normalizedMonth)),
					end: endOfMonth(new UTCDate(year, normalizedMonth))
				}
			}
			
			// If the current month does not contain the billing cycle date, we need to use the next month
			if(!isExists(year, normalizedMonth, billingCycle)) {
				const start = startOfMonth(new UTCDate(year, normalizedMonth + 1));
				const end = endOfDay(new UTCDate(year, normalizedMonth + 1, billingCycle - 1));
				return {
					start,
					end
				}
			}
			
			// Billing cycle is until the end of the billing cycle day - 1 of the next month
			// For example: A billing Cycle of 15 for the month of May is from 2022-05-15T00:00:00Z until 2022-06-14T23:59:59Z
			const start = new UTCDate(year, normalizedMonth, billingCycle);
			let end = addMonths(start, 1);
			end = subDays(end, 1);
			end = endOfDay(end);

			return {
				start,
				end
			}
}

export {
	parseInputCycle
}

export type {
	InputCycle,
	APIDate,
	ApiDateRange
}
