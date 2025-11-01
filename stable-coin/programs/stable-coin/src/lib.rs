use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Mint, MintTo, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("HUwgaHaWDvNH1vEuxzYWrYgxk41ymyhr3kk6tit3c6zh");

#[program]
pub mod stable_coin {
    use super::*;

    pub fn initialize_mint(ctx: Context<InitializeMint>) -> Result<()> {
        msg!("Mint initialized");
        Ok(())
    }

    pub fn mint_collateral(
        ctx: Context<MintCollateral>,
        request_id: [u8; 32],
        amount: u64
    ) -> Result<()> {
        // First, transfer collateral from user to vault
        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.user_collateral_account.to_account_info(),
            to: ctx.accounts.collateral_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        
        let transfer_cpi_program = ctx.accounts.token_program.to_account_info();
        let transfer_cpi_ctx = CpiContext::new(transfer_cpi_program, transfer_cpi_accounts);
        
        token::transfer(transfer_cpi_ctx, amount)?;
        msg!("Transferred {} collateral tokens to vault", amount);

        // Then, mint stable coins to user
        let mint_cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        
        let mint_cpi_program = ctx.accounts.token_program.to_account_info();
        let mint_cpi_ctx = CpiContext::new(mint_cpi_program, mint_cpi_accounts);
        
        token::mint_to(mint_cpi_ctx, amount)?;
        msg!("Minted {} stable coins to user", amount);

        // Initialize mint request
        let mint_request = &mut ctx.accounts.mint_request;
        mint_request.request_id = request_id;
        mint_request.mint_amount = amount;
        mint_request.fulfilled = true;
        mint_request.collateral_amount = amount;

        emit!(MintEvent {
            request_id,
            user: ctx.accounts.user.key(),
            amount,
            collateral_amount: amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // Add function to redeem collateral
    pub fn redeem_collateral(
        ctx: Context<RedeemCollateral>,
        request_id: [u8; 32],
        amount: u64
    ) -> Result<()> {
        // First, burn stable coins from user
        // Note: You'd need a Burn instruction for this, but for now we'll transfer back
        
        // Transfer collateral back from vault to user
        let transfer_cpi_accounts = Transfer {
            from: ctx.accounts.collateral_vault.to_account_info(),
            to: ctx.accounts.user_collateral_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        
        let transfer_cpi_program = ctx.accounts.token_program.to_account_info();
        let transfer_cpi_ctx = CpiContext::new(transfer_cpi_program, transfer_cpi_accounts);
        
        token::transfer(transfer_cpi_ctx, amount)?;
        msg!("Returned {} collateral tokens to user", amount);

        emit!(RedeemEvent {
            request_id,
            user: ctx.accounts.user.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    #[account(
        init,
        payer = mint_authority,
        mint::decimals = 6,
        mint::authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,
    
    // Initialize collateral vault
    #[account(
        init,
        payer = mint_authority,
        token::mint = collateral_mint,
        token::authority = vault_authority,
    )]
    pub collateral_vault: Account<'info, token::TokenAccount>,
    
    #[account(mut)]
    pub collateral_mint: Account<'info, Mint>,
    
    /// CHECK: Vault authority PDA
    #[account(
        seeds = [b"vault_authority"],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(request_id: [u8; 32])]
pub struct MintCollateral<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    /// CHECK: User account
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    // Collateral mint
    #[account(mut)]
    pub collateral_mint: Account<'info, Mint>,
    
    // User's collateral token account
    #[account(
        mut,
        associated_token::mint = collateral_mint,
        associated_token::authority = user,
    )]
    pub user_collateral_account: Account<'info, token::TokenAccount>,
    
    // Collateral vault
    #[account(
        mut,
        associated_token::mint = collateral_mint,
        associated_token::authority = vault_authority,
    )]
    pub collateral_vault: Account<'info, token::TokenAccount>,
    
    // User's stable coin token account
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, token::TokenAccount>,
    
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 8 + 1, // Added 8 more bytes for collateral_amount
        seeds = [b"mint_request", request_id.as_ref()], // Fixed: use as_ref() for [u8; 32]
        bump
    )]
    pub mint_request: Account<'info, MintRequest>,
    
    /// CHECK: Vault authority PDA
    #[account(
        seeds = [b"vault_authority"],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(request_id: [u8; 32])]
pub struct RedeemCollateral<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub collateral_mint: Account<'info, Mint>,
    
    // User's stable coin token account
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, token::TokenAccount>,
    
    // User's collateral token account
    #[account(
        mut,
        associated_token::mint = collateral_mint,
        associated_token::authority = user,
    )]
    pub user_collateral_account: Account<'info, token::TokenAccount>,
    
    // Collateral vault
    #[account(
        mut,
        associated_token::mint = collateral_mint,
        associated_token::authority = vault_authority,
    )]
    pub collateral_vault: Account<'info, token::TokenAccount>,
    
    /// CHECK: Vault authority PDA
    #[account(
        seeds = [b"vault_authority"],
        bump
    )]
    pub vault_authority: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[account]
pub struct MintRequest {
    pub request_id: [u8; 32],
    pub mint_amount: u64,
    pub collateral_amount: u64,
    pub fulfilled: bool,
}

#[event]
pub struct MintEvent {
    pub request_id: [u8; 32],
    pub user: Pubkey,
    pub amount: u64,
    pub collateral_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct RedeemEvent {
    pub request_id: [u8; 32],
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}