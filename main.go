package main

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/cli/go-gh/v2/pkg/api"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

func init() {
	rootCmd.PersistentFlags().String("github-token", "", "Github token")
	viper.BindPFlag("github-token", rootCmd.PersistentFlags().Lookup("github-token"))
	viper.BindEnv("github-token", "GITHUB_TOKEN")

	rootCmd.PersistentFlags().String("enterprise", "", "Enterprise name")
	rootCmd.MarkPersistentFlagRequired("enterprise")

	currentYear := time.Now().Year()
	rootCmd.PersistentFlags().Int("year", currentYear, "Specify the year, e.g. 2024")

	currentMonth := int(time.Now().Month())
	rootCmd.PersistentFlags().Int("month", currentMonth, "Specify the month, e.g. 1")

	rootCmd.PersistentFlags().Int("billing-cycle", 1, "First day of your billing cycle, e.g. 15")

	rootCmd.PersistentFlags().String("report-path", "./reports", "Path where the Excel-File will be generated (path will be generated recursively if it does not exist)")
}

var rootCmd = &cobra.Command{
	Use:   "gh billing-export",
	Short: "Generate a Billing Report",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		givenYear, _ := cmd.Flags().GetInt("year")
		givenMonth, _ := cmd.Flags().GetInt("month")
		givenBillingCycle, _ := cmd.Flags().GetInt("billing-cycle")
		githubToken, _ := cmd.Flags().GetString("github-token")
		enterprise, _ := cmd.Flags().GetString("enterprise")
		reportPath, _ := cmd.Flags().GetString("report-path")

		inputCycle := InputCycle{
			Year:         givenYear,
			Month:        givenMonth,
			BillingCycle: givenBillingCycle,
		}
		billingCycle := NewBillingCycle(inputCycle)

		fmt.Printf("Date Range: %s\n", billingCycle.GetDateRangeAsString())

		opts := api.ClientOptions{
			AuthToken: githubToken, // Replace with valid auth token.
			Log:       os.Stdout,
		}

		client, _ := api.NewRESTClient(opts)
		octokit := Octokit{client}

		allUsageItems, err := octokit.getUsageItemsForDates(enterprise, billingCycle.GetRequiredAPIDateRange())

		if err != nil {
			fmt.Printf("Error: %s\n", err)
			return
		}

		// Filter usage Items using the billing_cycle IsInDateRange method
		relevantUsageItems := FilterUsageItems(allUsageItems, billingCycle.IsInDateRange)
		fmt.Printf("Found %d usage items of which %d are in given Billing Cycle\n", len(allUsageItems), len(relevantUsageItems))

		orgReport := NewOrganizationReport(relevantUsageItems)

		// ensure the reportPath exists
		err = os.MkdirAll(reportPath, os.ModePerm)

		excelFileName := filepath.Join(reportPath, fmt.Sprintf("GitHub_Usage_%s.xlsx", billingCycle.GetDateRangeAsString()))

		err = GenerateExcel(excelFileName, orgReport)
		if err != nil {
			fmt.Printf("Error: %s\n", err)
			return
		}

		fmt.Printf("Report generated at %s\n", reportPath)
	},
}

func main() {
	cobra.CheckErr(rootCmd.Execute())
}

// func main() {
// 	fmt.Println("hi world, this is the gh-billing-report extension!")
// 	client, err := api.DefaultRESTClient()
// 	if err != nil {
// 		fmt.Println(err)
// 		return
// 	}
// 	response := struct{ Login string }{}
// 	err = client.Get("user", &response)
// 	if err != nil {
// 		fmt.Println(err)
// 		return
// 	}
// 	fmt.Printf("running as %s\n", response.Login)
// }

// For more examples of using go-gh, see:
// https://github.com/cli/go-gh/blob/trunk/example_gh_test.go
