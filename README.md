# GH Billing VNext Report

A command line tool to use GitHub's Billing VNext APIs to export an Excel-Report with the usage for a given Billing-Cycle, grouped and aggregated by organization.

## Getting Started

### Using the GH Extension

The easiest way to use this tool is to install the [GH Extension](https://cli.github.com/) and run the following command:

```bash
gh extension install davelosert/billing-vnext-report
```

Afterwards, you can run the following command to generate a report:

```bash
gh billing-vnext-report --enterprise my-enterprise --github-token $GITHUB_TOKEN
```

### Using the repo directly

You can also clone this repo and run the following commands:

```bash
go run . --enterprise my-enterprise --github-token $GITHUB_TOKEN
```

> [!NOTE]
> This requires you to have [Go](https://golang.org/) v >1.21.5 installed on your machine.

## Options

All options can be set as flags via the command line:

```bash
gh billing-vnext-report --github-token <github-token> --enterprise <enterprise-slug> --year <year> --month <month> --billing-cycle <billing-cycle> --report-path <report-path>
```

The `GITHUB_TOKEN` will be automatically read from the Environment-Variable, but can be overwritten using the `--github-token` flag.

| Option                            | Description                                                         | Default Value | Environment Variable |
| --------------------------------- | ------------------------------------------------------------------- | ------------- | -------------------- |
| `--github-token <github-token>`   | Github token, see below for permissions                             | None          | `GITHUB_TOKEN`       |
| `--enterprise <enterprise-slug>`  | Enterprise Slug to get the data from                                | None          | None                 |
| `--year <year>`                   | Specify the year, e.g. 2024                                         | Current year  | None                 |
| `--month <month>`                 | Specify the month, e.g. 1                                           | Current month | None                 |
| `--billing-cycle <billing-cycle>` | First day of your billing cycle (see below for further information) | 1             | None                 |
| `--report-path <report-path>`     | Directory where the report will be saved                            | `./reports`   | None                 |

### Billing Cycle

By default, the generated report covers an entire calendar month (e.g., `1st of January` to `31st of January`).

You can customize this range using the `--billing-cycle` option, which sets the start day of your billing cycle. The report will then cover the period from the specified billing cycle day of the input month to the day before the same billing cycle day of the following month. For instance:

If you set `--year 2024 --month 1 --billing-cycle 15`, the report will cover the period from `15th of January 2024` to `14th of February 2024`.

For billing cycles starting on a day that doesn't exist in the input month (essentially the 29th and 30th for February, or the 31st for 30-day months), the report will cover the period from the first day of the following month to the day before the billing cycle day of the subsequent month. For example:

If you set `--year 2024 --month 2 --billing-cycle 30`, the report will cover the period from `1st of March 2024` to `29th of March 2024`.

> [!IMPORTANT]
> Please note that all cutoff dates are in UTC. Therefore, a report with `--year 2024 --month 1 --billing-cycle 15` will include all usage data from `15th of January 2024 00:00:00 UTC` to `14th of February 2024 23:59:59 UTC`.

### Github Token Permissions

You need to create a [classical GitHub Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic) with the following Scopes:

- `manage_billing:enterprise`
- `read:enterprise`

## License

This project is licensed under the [MIT License](./LICENSE).
