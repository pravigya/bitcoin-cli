const { Command, flags } = require("@oclif/command");
const { BIP32Factory } = require("bip32");
const ecc = require("tiny-secp256k1");
const bip32 = BIP32Factory(ecc);
const bip39 = require("bip39");
const bitcoin = require("bitcoinjs-lib");
const fs = require("fs").promises;
const path = require("path");

class ImportWalletCommand extends Command {
  async run() {
    const { flags } = this.parse(ImportWalletCommand);
    const mnemonic = flags.mnemonic;
    const walletName = flags.name;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    const walletPath = "m/44'/1'/0'/0/0";
    const account = root.derivePath(walletPath);
    const node = account.derive(0).derive(0);
    const btcAddress = bitcoin.payments.p2pkh({
      pubkey: node.publicKey,
    }).address;

    let jsonData = {};
    try {
      const filePath = path.join(__dirname, "../../wallets.json");
      const existingData = await fs.readFile(filePath, "utf-8");

      jsonData = JSON.parse(existingData);
    } catch (error) {}
    jsonData[walletName] = btcAddress;

    const filePath = path.join(__dirname, "../../wallets.json");
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));

    this.log(`Wallet '${walletName}' has been added to the JSON file.`);
  }
}

ImportWalletCommand.description = ``;

ImportWalletCommand.flags = {
  name: flags.string({
    char: "n",
    description: "name of the wallet",
    required: true,
  }),
  mnemonic: flags.string({
    char: "m",
    description: "mnemonic of the wallet to import",
    required: true,
  }),
};

module.exports = ImportWalletCommand;
