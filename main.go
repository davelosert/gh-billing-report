package main

import (
	"fmt"
	"os"
	"time"

	"github.com/cli/go-gh/v2/pkg/api"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var rootCmd = &cobra.Command{
	Use:   "gh billing-export",
	Short: "Generate a Billing Report",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		year, _ := cmd.Flags().GetInt("year")
		month, _ := cmd.Flags().GetInt("month")
		billingCycle, _ := cmd.Flags().GetInt("billing-cycle")
		githubToken, _ := cmd.Flags().GetString("github-token")
		enterprise, _ := cmd.Flags().GetString("enterprise")
		inputCycle := InputCycle{
			Year:         year,
			Month:        month,
			BillingCycle: billingCycle,
		}
		billingCycleO := NewBillingCycle(inputCycle)

		fmt.Printf("Date Range: %s\n", billingCycleO.GetDateRangeAsString())

		opts := api.ClientOptions{
			AuthToken: githubToken, // Replace with valid auth token.
			Log:       os.Stdout,
		}

		client, _ := api.NewRESTClient(opts)
		octokit := Octokit{client}

		usageItems, err := octokit.getUsageItemsForDates(enterprise, billingCycleO.GetRequiredAPIDateRange())

		if err != nil {
			fmt.Printf("Error: %s\n", err)
			return
		}

		fmt.Printf("Found %d usage items\n", len(usageItems))
	},
}

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
