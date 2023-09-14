const { Command, flags } = require("@oclif/command");
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

class GetBalanceCommand extends Command {
  async run() {
    const { flags } = this.parse(GetBalanceCommand);
    const jsonFilePath = path.join(__dirname, "../../wallets.json");
    const walletName = flags.name;
    const jsonData = await fs.readFile(jsonFilePath, "utf-8");
    const wallets = JSON.parse(jsonData);
    const address = wallets[walletName];
    const apiBaseUrl = "https://api.blockcypher.com/v1/btc/test3";
    const balanceApiUrl = `${apiBaseUrl}/addrs/${address}?unspentOnly=true&includeScript=true`;
    axios
      .get(balanceApiUrl)
      .then((response) => {
        const balanceSatoshis = response.data.final_balance;
        const balanceBTC = balanceSatoshis / 1e8;
        console.log(`Balance: ${balanceBTC} BTC`);
      })
      .catch((error) => {
        console.error("Error fetching balance:", error);
      });
  }
}
GetBalanceCommand.description = `Get the balance of a wallet using the name`;
GetBalanceCommand.flags = {
  name: flags.string({
    char: "n",
    description: "name of the wallet",
  }),
};

module.exports = GetBalanceCommand;
