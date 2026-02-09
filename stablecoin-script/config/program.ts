import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { StableCoin } from '../idl/stable_coin';
import { PUBLIC_STABLE_COIN_PROGRAM_ID } from '../constants';

// Import the IDL (you'll need to generate this from your Rust program)
// First, run `anchor build` and copy the IDL from target/idl/stable_coin.json
import idl from '../idl/stable_coin.json';

export const getStableCoinProgram = (connection: Connection, wallet: any): Program<StableCoin> => {
  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed' }
  );
  
  return new Program<StableCoin>(
    idl as any,
    PUBLIC_STABLE_COIN_PROGRAM_ID,
    provider
  );
};

// Alternative version if you're using a keypair directly (for scripts)
export const getStableCoinProgramWithKeypair = (connection: Connection, payer: Keypair): Program<StableCoin> => {
  const wallet = {
    publicKey: payer.publicKey,
    signTransaction: async (transaction: any) => {
      transaction.sign(payer);
      return transaction;
    },
    signAllTransactions: async (transactions: any[]) => {
      transactions.forEach(transaction => transaction.sign(payer));
      return transactions;
    },
  };

  return getStableCoinProgram(connection, wallet);
};