# Stablecoin Script

TypeScript scripts to drive the stablecoin Anchor program: initialize the mint, create token accounts, mint against collateral, and redeem collateral.

## Prerequisites

- Node.js 18+ (for `crypto.getRandomValues`).
- Solana CLI configured for your target cluster.
- A deployed stablecoin program (see `stable-coin/`).
- An IDL JSON for the program.

## Setup

1. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn install
```

2. Ensure your wallet is available at `~/.config/solana/id.json` and your Solana CLI cluster matches your target network:

```bash
solana config set --url devnet
```

3. Provide the program ID and IDL:

- Update the program ID in `stablecoin-script/config.ts`.
- Create `stablecoin-script/constants.ts` and keep it in sync:

```ts
import { PublicKey } from '@solana/web3.js';

export const PUBLIC_STABLE_COIN_PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID');
```

- Place the IDL JSON at `stablecoin-script/idl/stable_coin.json` (from `anchor build`).
- The file `stablecoin-script/idl/stable_coin.ts` is generated from that JSON by `stablecoin-script/generate-types.ts`. It provides a typed `StableCoin` IDL used by `stablecoin-script/config/program.ts`.

4. Update collateral mint(s) in `stablecoin-script/config.ts` to match the cluster you are using (the defaults are mainnet mints).

## Running

Run the end-to-end demo:

```bash
npx esrun main.ts
```

Or run individual scripts:

```bash
npx esrun initialize-mint.ts
npx esrun create-token-account.ts
npx esrun mint-collateral.ts
npx esrun redeem-collateral.ts
```

## Notes

- Amounts are in base units. For a 6-decimal token (e.g. USDC), `100 * 1e6` means 100 tokens.
- If you switch clusters, update `USDC_MINT`/`USDT_MINT` and `programId` accordingly.
