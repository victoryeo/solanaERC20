This is stablecoin on solana

# To build:

anchor build
_or_
cargo build-sbf

# To deploy testnet

solana-test-validator
anchor deploy

# custom anchor

build a custom anchor that is specfic to your env
cargo install --git https://github.com/coral-xyz/anchor --tag v0.32.1 anchor-cli --locked --force
