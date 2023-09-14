const { Command, flags } = require("@oclif/command");
const { BIP32Factory } = require("bip32");
const ecc = require("tiny-secp256k1");
const bip32 = BIP32Factory(ecc);
const bip39 = require("bip39");
const bitcoin = require("bitcoinjs-lib");
const axios = require("axios");

class UnusedWalletCommand extends Command {
  async run() {
    const { flags } = this.parse(UnusedWalletCommand);
    const mnemonic = flags.mnemonic;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const network = bitcoin.networks.testnet;
    const root = bip32.fromSeed(seed, network);

    while (true) {
      let path = "m/44'/1'/0'/0/";
      let index = 0;
      let child = root.derivePath(`${path}${index}`);
      let publicKey = child.publicKey;
      let address = bitcoin.payments.p2pkh({
        pubkey: publicKey,
        network,
      }).address;
      const apiBaseUrl = "https://api.blockcypher.com/v1/btc/test3";
      let addressInfoUrl = `${apiBaseUrl}/addrs/${address}`;

      let response = await axios.get(addressInfoUrl);
      if (response.data.n_tx === 0) {
        console.log(`Unused Address: ${address}`);
        break;
      }
      index++;
    }
  }
}

UnusedWalletCommand.description = `Print an unused bitcoin address of the wallet`;
UnusedWalletCommand.flags = {
  mnemonic: flags.string({
    char: "m",
    description: "mnemonic of the wallet to import",
  }),
};

module.exports = UnusedWalletCommand;
