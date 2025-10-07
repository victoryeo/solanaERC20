import { mintTo, transfer, getAccount, getMint } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

// Substitute in your token mint account from create-token-mint.ts
const tokenMintAccount = new PublicKey(
  "GsrB8JoF5coAKSr525CdaUGaFfiHDVBfUmD2dFDPu6Jj"
);
console.log("Token Mint Account:", tokenMintAccount.toString());

// Substitute in your own, or a friend's token account address, based on the previous step.
const recipientAssociatedTokenAccount = new PublicKey(
  //"3QRd9rxjS9G85NoYiHbfCuda25Lwm6DinuWuossxuNnW"
  "3PTyA6fA5Npuvtp4c2F6o2QGpKTEK6qraRFhExfuM9Fi"
);
console.log(
  "Recipient Token Account:",
  recipientAssociatedTokenAccount.toString()
);

// ===== ADDED: FUNCTION TO CHECK TOKEN BALANCE =====

console.log(`\n=== Checking Balance ===`);

// Get the token account info
const tokenAccount = await getAccount(
  connection,
  recipientAssociatedTokenAccount
);
console.log("tokenAccount", tokenAccount);

const ownerAddress = tokenAccount.owner.toString();

// Get mint info to understand decimals
const mintInfo = await getMint(connection, tokenAccount.mint);

// Calculate the balance in major units (considering decimals)
const balanceInMajorUnits =
  Number(tokenAccount.amount) / Math.pow(10, mintInfo.decimals);

console.log(`🔍 Owner: ${ownerAddress}`);
console.log(`💰 Balance: ${balanceInMajorUnits} tokens`);
console.log(`🔢 Raw Balance: ${tokenAccount.amount.toString()} minor units`);
console.log(`🎯 Mint: ${tokenAccount.mint.toString()}`);
console.log(`👤 Owner: ${tokenAccount.owner.toString()}`);
console.log(`📊 Decimals: ${mintInfo.decimals}`);
