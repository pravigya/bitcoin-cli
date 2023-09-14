const { Command, flags } = require("@oclif/command");
const { BIP32Factory } = require("bip32");
const ecc = require("tiny-secp256k1");
const bip32 = BIP32Factory(ecc);
const bip39 = require("bip39");
const bitcoin = require("bitcoinjs-lib");
const fs = require("fs").promises;
const path = require("path");

class GenerateWalletCommand extends Command {
  async run() {
    const { flags } = this.parse(GenerateWalletCommand);
    const network = bitcoin.networks.testnet;
    const walletPath = `m/44'/1'/0'/0`;
    const walletName = flags.name;
    const mnemonic = bip39.generateMnemonic();
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed, network);

    const account = root.derivePath(walletPath);
    const node = account.derive(0).derive(0);

    const btcAddress = bitcoin.payments.p2pkh({
      pubkey: node.publicKey,
      network: network,
    }).address;

    this.log(`Creating a Bitcoin wallet named ${walletName}...`);

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

GenerateWalletCommand.description = `Generate a bip39 wallet with a name`;

GenerateWalletCommand.flags = {
  name: flags.string({
    char: "n",
    description: "name of the wallet",
    required: true,
  }),
};

module.exports = GenerateWalletCommand;
