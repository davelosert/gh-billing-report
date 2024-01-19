import { describe, it, expect } from 'vitest';
import { parseInputCycle } from './InputCycle.js';
import { createMockUsageItem } from './UsageItemMock.js';

describe('InputCycle', () => {
	describe('getDateRange', () => {
		it('if billing cycle is 1, returns the start and end of the given month', () => {
			const input = parseInputCycle({ year: 2022, month: 5, billingCycle: 1 });
			const expected = {
				start: new Date("2022-05-01T00:00:00.000Z"),
				end: new Date("2022-05-31T23:59:59.999Z")
			};

			const result = input.getDateRange();

			expect(result).toEqual(expected);
		});
		
		it('if billing cycle is > 1, creates a date range from the given month and the end of the previous day of the next month', () => {
			const input = parseInputCycle({ year: 2022, month: 5, billingCycle: 2 });
			const expected = {
				start: new Date("2022-05-02T00:00:00.000Z"),
				end: new Date("2022-06-01T23:59:59.999Z")
			};

			const result = input.getDateRange();

			expect(result).toEqual(expected);
		});

		it('handles billing dates for months that do not contain the billing cycle date by having the first of the next month as start date', () => {
			const input = parseInputCycle({ year: 2024, month: 4, billingCycle: 31 });
			const expected = {
				start: new Date("2024-05-01T00:00:00.000Z"),
				end: new Date("2024-05-30T23:59:59.999Z")
			};
			
			const result = input.getDateRange();

			expect(result).toEqual(expected);
		});
		
		it('handles a billing date of 30 correct in February', () => {
			const input = parseInputCycle({ year: 2024, month: 2, billingCycle: 30 });
			const expected = {
				start: new Date("2024-03-01T00:00:00.000Z"),
				end: new Date("2024-03-29T23:59:59.999Z")
			};

			const result = input.getDateRange();

			expect(result).toEqual(expected);
		});
		
		it('handles leap years correctly when billing date is not 29', () => {
			const input = parseInputCycle({ year: 2024, month: 2, billingCycle: 3 });
			const expected = {
				start: new Date("2024-02-03T00:00:00.000Z"),
				end: new Date("2024-03-02T23:59:59.999Z")
			};

			const result = input.getDateRange();

			expect(result).toEqual(expected);
		});
		
		it('handles leap years correctly when billing date is 29', () => {
			const input = parseInputCycle({ year: 2024, month: 2, billingCycle: 29 });
			const expected = {
				start: new Date("2024-02-29T00:00:00.000Z"),
				end: new Date("2024-03-28T23:59:59.999Z")
			};

			const result = input.getDateRange();

			expect(result).toEqual(expected);
		});
	});

	describe('getRequiredAPIDateRange', () => {
		it('if billing cycle is 1, returns only the given year and month', () => {
			const input = parseInputCycle({ year: 2022, month: 5, billingCycle: 1 });
			const expected = [{year: 2022, month: 5 }];
			const result = input.getRequiredAPIDateRange();
			expect(result).toEqual(expected);
		});

		it('if billing cycle is > 1, returns the given and the next month', () => {
			const input = parseInputCycle({ year: 2022, month: 5, billingCycle: 2 });
			const expected = [{ year: 2022, month: 5 }, { year: 2022, month: 6 }];
			const result = input.getRequiredAPIDateRange();
			expect(result).toEqual(expected);
		});
	
		it('if billing cycle is > 1 and month is 12, returns the first month of the next year', () => {
			const input = parseInputCycle({ year: 2021, month: 12, billingCycle: 2 });
			const expected = [{ year: 2021, month: 12 }, { year: 2022, month: 1 }];
			const result = input.getRequiredAPIDateRange();
			expect(result).toEqual(expected);
		});
		
		it('if billing cycle day is 31 and month is 2 (February), only returns March', () => {
			const input = parseInputCycle({ year: 2024, month: 2, billingCycle: 31 });
			const expected = [{ year: 2024, month: 3 }];
			const result = input.getRequiredAPIDateRange();
			expect(result).toEqual(expected);
		});
	});
	
	describe('isInDateRange', () => {
		it('if billing cycle is 1 and usageItem is in same month, return true', () => {
			const usageItem = createMockUsageItem({ date: '2022-05-01T00:00:00Z' });
			const input = parseInputCycle({ year: 2022, month: 5, billingCycle: 1 });
			const result = input.isInDateRange(usageItem);
			expect(result).toBe(true);
		});
		
		it('if billing cycle is 1 and usageItem is in different month, return false', () => {
			const usageItem = createMockUsageItem({ date: '2022-06-01T00:00:00Z' });
			const input = parseInputCycle({ year: 2022, month: 5, billingCycle: 1 });
			const result = input.isInDateRange(usageItem);
			expect(result).toBe(false);
		});
		
		it('if billing cycle is > 1 and usageItem is within the same month, return true', () => {
			const usageItem = createMockUsageItem({ date: '2022-05-15T00:00:00Z' });
			const input = parseInputCycle({ year: 2022, month: 5, billingCycle: 2 });
			const result = input.isInDateRange(usageItem);
			expect(result).toBe(true);
		});
		
		it('usage item is exactly at start of billing cycle, return true', () => {
			const usageItem = createMockUsageItem({ date: '2022-05-02T00:00:00Z' });
			const input = parseInputCycle({ year: 2022, month: 5, billingCycle: 2 });
			const result = input.isInDateRange(usageItem);
			expect(result).toBe(true);
		});

		it('usage item is exactly at end of billing cycle, return true', () => {
			const usageItem = createMockUsageItem({ date: '2022-06-01T23:59:59Z' });
			const input = parseInputCycle({ year: 2022, month: 5, billingCycle: 2 });
			const result = input.isInDateRange(usageItem);
			expect(result).toBe(true);
		});
	});
	
	describe('getDateRangeAsString()', () => {
		it('returns a string of the format "YYYY-MM-DD_to_YYYY-MM-DD"', () => {
			const input = parseInputCycle({ year: 2022, month: 5, billingCycle: 1 });
			
			expect(input.getDateRangeAsString()).toEqual('2022-05-01_to_2022-05-31');
		});
	
	});
});
