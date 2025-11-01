import { Keypair, Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

// Connection to Solana cluster
export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Load payer keypair
export const payer = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(
    readFileSync(
      path.join(homedir(), '.config/solana/id.json'),
      'utf-8'
    )
  ))
);

// Your stable coin program ID
export const programId = new PublicKey('HUwgaHaWDvNH1vEuxzYWrYgxk41ymyhr3kk6tit3c6zh');

// Common token mints (for testing)
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
export const USDT_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');