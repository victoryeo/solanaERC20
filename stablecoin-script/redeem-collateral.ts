import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { connection, payer, programId } from './config';
import { getStableCoinProgram } from './config/program';

export async function redeemCollateral(
  mint: PublicKey,
  collateralMint: PublicKey,
  user: PublicKey,
  amount: number
): Promise<string> {
  const program = getStableCoinProgram(connection, payer);
  
  // Generate unique request ID
  const requestId = new Uint8Array(32);
  crypto.getRandomValues(requestId);

  // Find PDA
  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault_authority')],
    programId
  );

  // Get token accounts
  const userTokenAccount = await getAssociatedTokenAddress(mint, user);
  const userCollateralAccount = await getAssociatedTokenAddress(collateralMint, user);
  const collateralVault = await getAssociatedTokenAddress(collateralMint, vaultAuthority, true);

  console.log('Redeeming collateral with:');
  console.log('User:', user.toString());
  console.log('Amount:', amount);
  console.log('Request ID:', Buffer.from(requestId).toString('hex'));

  try {
    const tx = await program.methods
      .redeemCollateral(
        Array.from(requestId),
        BigInt(amount)
      )
      .accounts({
        user: user,
        mint: mint,
        collateralMint: collateralMint,
        userTokenAccount: userTokenAccount,
        userCollateralAccount: userCollateralAccount,
        collateralVault: collateralVault,
        vaultAuthority: vaultAuthority,
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
      })
      .rpc();

    console.log('Collateral redeemed successfully:', tx);
    return tx;
  } catch (error) {
    console.error('Error redeeming collateral:', error);
    throw error;
  }
}