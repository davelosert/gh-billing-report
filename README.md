# GH Billing VNext Report

A command line tool to use the GitHub's Billing VNext APIs to export an Excel-Report with the usage for a given Billing-Cycle, grouped and aggregated by organization.

## Usage

### Options

| Option                            | Description                                                         | Default Value | Environment Variable |
| --------------------------------- | ------------------------------------------------------------------- | ------------- | -------------------- |
| `--github-token <github-token>`   | Github token, see below for permissions                             | None          | `GITHUB_TOKEN`       |
| `--enterprise <enterprise-slug>`  | Enterprise Slug to get the data from                                | None          | None                 |
| `--year <year>`                   | Specify the year, e.g. 2024                                         | Current year  | None                 |
| `--month <month>`                 | Specify the month, e.g. 1                                           | Current month | None                 |
| `--billing-cycle <billing-cycle>` | First day of your billing cycle (see below for further information) | 1             | None                 |
| `--report-path <report-path>`     | Directory where the report will be saved                            | `./reports`   | None                 |

#### Billing Cycle

By default, the generated report will span an entire calendar month (e.g. `1st of January` to `31st of January`).

You can use the `--billing-cycle` option and set it to the day of a month were your billing cycle starts if you report. Using this, the report will span from the given billing cycle day of the given month to the day before the given billing cycle day of the next month, for example:

With the setting `--year 2024 --month 1 --billing-cycle 15` you will get a report from `15th of January 2024` to `14th of February 2024`.

If you have a billing-cycle with a day that does not exist in the given month (essential 29 and 30 for February or 31 for 30-day-calendar months), the report will span from the next day of the next month to the day before the given billing cycle day of the month after that, for example:

With the setting `--year 2024 --month 2 --billing-cycle 30` you will get a report from `1st of March 2024` to `29th of March 2024`.

> [!IMPORTANT]
> All cutoff dates are in UTC, so a report with `--year 2024 --month 1 --billing-cycle 15` will include all usages from the `15th of January 2024 00:00:00 UTC` to `14th of February 2024 23:59:59 UTC`.

#### Github Token Permissions

You need to create a [classical GitHub Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic) with the following Scopes:

- `manage_billing:enterprise`
- `read:enterprise`
