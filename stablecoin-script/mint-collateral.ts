import { PublicKey, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { connection, payer, programId } from './config';
import { getStableCoinProgram } from './config/program';

export async function mintStableCoins(
  mint: PublicKey,
  collateralMint: PublicKey,
  user: PublicKey,
  amount: number
): Promise<string> {
  const program = getStableCoinProgram(connection, payer);
  
  // Generate unique request ID
  const requestId = new Uint8Array(32);
  crypto.getRandomValues(requestId);

  // Find PDAs
  const [mintRequest] = PublicKey.findProgramAddressSync(
    [Buffer.from('mint_request'), requestId],
    programId
  );

  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault_authority')],
    programId
  );

  // Get token accounts
  const userCollateralAccount = await getAssociatedTokenAddress(collateralMint, user);
  const collateralVault = await getAssociatedTokenAddress(collateralMint, vaultAuthority, true);
  const userTokenAccount = await getAssociatedTokenAddress(mint, user);

  console.log('Minting stable coins with:');
  console.log('User:', user.toString());
  console.log('Amount:', amount);
  console.log('Request ID:', Buffer.from(requestId).toString('hex'));
  console.log('User Collateral Account:', userCollateralAccount.toString());
  console.log('Collateral Vault:', collateralVault.toString());
  console.log('User Token Account:', userTokenAccount.toString());

  try {
    const tx = await program.methods
      .mintCollateral(
        Array.from(requestId),
        BigInt(amount)
      )
      .accounts({
        mintAuthority: payer.publicKey,
        user: user,
        mint: mint,
        collateralMint: collateralMint,
        userCollateralAccount: userCollateralAccount,
        collateralVault: collateralVault,
        userTokenAccount: userTokenAccount,
        mintRequest: mintRequest,
        vaultAuthority: vaultAuthority,
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('Stable coins minted successfully:', tx);
    return tx;
  } catch (error) {
    console.error('Error minting stable coins:', error);
    throw error;
  }
}