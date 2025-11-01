import { PublicKey } from '@solana/web3.js';
import { initializeStableCoinMint } from './initialize-mint';
import { mintStableCoins } from './mint-collateral';
import { redeemCollateral } from './redeem-collateral';
import { createStableCoinTokenAccount, createCollateralTokenAccount } from './create-token-account';
import { payer, USDC_MINT } from './config';

async function main() {
  console.log('Stable Coin Protocol Demo');
  console.log('Payer:', payer.publicKey.toString());

  try {
    // 1. Initialize stable coin mint
    console.log('\n1. Initializing stable coin mint...');
    const { mint, collateralVault } = await initializeStableCoinMint(USDC_MINT);
    
    // 2. Create token accounts for user
    console.log('\n2. Creating token accounts...');
    const stableCoinAccount = await createStableCoinTokenAccount(mint, payer.publicKey);
    const collateralAccount = await createCollateralTokenAccount(USDC_MINT, payer.publicKey);
    
    // 3. Mint stable coins (deposit collateral and get stable coins)
    console.log('\n3. Minting stable coins...');
    const mintAmount = 100 * 1e6; // 100 USDC collateral
    const mintTx = await mintStableCoins(mint, USDC_MINT, payer.publicKey, mintAmount);
    
    // 4. Redeem collateral (return stable coins and get collateral back)
    console.log('\n4. Redeeming collateral...');
    const redeemAmount = 50 * 1e6; // 50 stable coins
    const redeemTx = await redeemCollateral(mint, USDC_MINT, payer.publicKey, redeemAmount);
    
    console.log('\n✅ Demo completed successfully!');
    console.log('Stable Coin Mint:', mint.toString());
    console.log('Collateral Vault:', collateralVault.toString());
    console.log('Mint Transaction:', mintTx);
    console.log('Redeem Transaction:', redeemTx);
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

main().catch(console.error);