import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { connection, payer } from './config';

// Create associated token account for stable coin
export async function createStableCoinTokenAccount(
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const associatedToken = await getAssociatedTokenAddress(mint, owner);
  
  const transaction = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      payer.publicKey,
      associatedToken,
      owner,
      mint
    )
  );

  const signature = await connection.sendTransaction(transaction, [payer]);
  await connection.confirmTransaction(signature);
  
  console.log(`Created stable coin token account: ${associatedToken.toString()}`);
  return associatedToken;
}

// Create associated token account for collateral
export async function createCollateralTokenAccount(
  collateralMint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const associatedToken = await getAssociatedTokenAddress(collateralMint, owner);
  
  const transaction = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      payer.publicKey,
      associatedToken,
      owner,
      collateralMint
    )
  );

  const signature = await connection.sendTransaction(transaction, [payer]);
  await connection.confirmTransaction(signature);
  
  console.log(`Created collateral token account: ${associatedToken.toString()}`);
  return associatedToken;
}