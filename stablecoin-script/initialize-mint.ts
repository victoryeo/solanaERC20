import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { connection, payer, programId } from './config';
import { getStableCoinProgram } from './config/program';

export async function initializeStableCoinMint(
  collateralMint: PublicKey
): Promise<{ mint: PublicKey; collateralVault: PublicKey; vaultAuthority: PublicKey }> {
  const program = getStableCoinProgram(connection, payer);
  
  // Generate new mint for stable coin
  const mint = Keypair.generate();
  
  // Find PDA for vault authority
  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault_authority')],
    programId
  );

  // Create collateral vault account (will be initialized by the program)
  const collateralVault = await getAssociatedTokenAddress(
    collateralMint,
    vaultAuthority,
    true // Allow off-curve
  );

  console.log('Initializing stable coin mint with:');
  console.log('Mint:', mint.publicKey.toString());
  console.log('Collateral Mint:', collateralMint.toString());
  console.log('Vault Authority:', vaultAuthority.toString());
  console.log('Collateral Vault:', collateralVault.toString());

  try {
    const tx = await program.methods
      .initializeMint()
      .accounts({
        mintAuthority: payer.publicKey,
        mint: mint.publicKey,
        collateralVault: collateralVault,
        collateralMint: collateralMint,
        vaultAuthority: vaultAuthority,
        tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        systemProgram: SystemProgram.programId,
        rent: PublicKey.default, // Anchor handles this automatically
      })
      .signers([mint, payer])
      .rpc();

    console.log('Stable coin mint initialized successfully:', tx);
    
    return {
      mint: mint.publicKey,
      collateralVault,
      vaultAuthority
    };
  } catch (error) {
    console.error('Error initializing stable coin mint:', error);
    throw error;
  }
}