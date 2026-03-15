This is stablecoin on solana

# To build:

anchor build
_or_
cargo build-sbf

# To deploy local testnet

solana-test-validator
anchor deploy

# custom anchor

build a custom anchor that is specfic to your env
cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli --locked --force

# Program ID

After deploy, note the program ID printed by the CLI. Keep this value in sync with:

- `stablecoin-script/constants.ts` as `PUBLIC_STABLE_COIN_PROGRAM_ID`
- `stablecoin-script/config.ts` as `programId`

# IDL

`anchor build` produces the IDL at `stable-coin/target/idl/stable_coin.json`.
Copy it to `stablecoin-script/idl/stable_coin.json` for the TypeScript scripts.
