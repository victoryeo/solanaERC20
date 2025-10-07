import { mintTo } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { transfer } from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"));

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const user = getKeypairFromEnvironment("SECRET_KEY");

// Substitute in your token mint account from create-token-mint.ts
const tokenMintAccount = new PublicKey(
  "GsrB8JoF5coAKSr525CdaUGaFfiHDVBfUmD2dFDPu6Jj"
);
console.log(tokenMintAccount);

// Substitute in your own, or a friend's token account address, based on the previous step.
const recipientAssociatedTokenAccount = new PublicKey(
  "3QRd9rxjS9G85NoYiHbfCuda25Lwm6DinuWuossxuNnW"
);
console.log(recipientAssociatedTokenAccount);

const transactionSignature = await mintTo(
  connection,
  user,
  tokenMintAccount,
  recipientAssociatedTokenAccount,
  user,
  10 * MINOR_UNITS_PER_MAJOR_UNITS
);

const link = getExplorerLink("transaction", transactionSignature, "devnet");

console.log(`✅ Success! Mint Token Transaction: ${link}`);

// ===== ADDED: TRANSFER TOKENS TO ANOTHER ADDRESS =====

let transferAmount = 2;
let toWalletAddress = "7kLA1do3jyZs9585XnjgxES2ZZfm8mAMq9DZLTDZNHJ9";

console.log(
  `\n=== Transferring ${transferAmount} tokens to ${toWalletAddress} ===`
);

// Convert the recipient's wallet address to PublicKey
const recipientWallet = new PublicKey(toWalletAddress);

// Get or create the recipient's associated token account
const { getOrCreateAssociatedTokenAccount } = await import("@solana/spl-token");

const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  user, // Payer for the transaction (creates account if needed)
  tokenMintAccount, // Mint address of our token
  recipientWallet // Owner of the token account
);

console.log(
  "Recipient's Token Account:",
  recipientTokenAccount.address.toString()
);

// Transfer tokens from original recipient to new recipient
const transferSignature = await transfer(
  connection,
  user, // Payer
  recipientAssociatedTokenAccount, // Source token account (where tokens currently are)
  recipientTokenAccount.address, // Destination token account
  user, // Owner of the source token account
  transferAmount * MINOR_UNITS_PER_MAJOR_UNITS // Amount to transfer
);

const transferLink = getExplorerLink(
  "transaction",
  transferSignature,
  "devnet"
);
console.log(`✅ Success! Transfer Token Transaction: ${transferLink}`);
