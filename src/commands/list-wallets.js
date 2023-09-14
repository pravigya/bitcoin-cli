const { Command, flags } = require("@oclif/command");
const fs = require("fs");
const path = require("path");

class ListWalletsCommand extends Command {
  async run() {
    const jsonFilePath = path.join(__dirname, "../../wallets.json");
    fs.readFile(jsonFilePath, "utf8", (err, data) => {
      try {
        const jsonData = JSON.parse(data);
        this.log(jsonData);
      } catch (parseError) {
        console.error(`Error parsing JSON: ${parseError}`);
      }
    });
  }
}
ListWalletsCommand.description = `List all wallets in the local storage`;

ListWalletsCommand.flags = {};

module.exports = ListWalletsCommand;
