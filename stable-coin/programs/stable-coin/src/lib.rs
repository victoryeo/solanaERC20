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
        // Mint tokens via CPI
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::mint_to(cpi_ctx, amount)?;

        // Initialize mint request
        let mint_request = &mut ctx.accounts.mint_request;
        mint_request.request_id = request_id;
        mint_request.mint_amount = amount;
        mint_request.fulfilled = true;

        emit!(MintEvent {
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
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(request_id: [u8; 12])]
pub struct MintCollateral<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    
    /// CHECK: User account
    pub user: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_token_account: Account<'info, token::TokenAccount>,
    
    #[account(
        init,
        payer = mint_authority,
        space = 8 + 32 + 8 + 1,
        seeds = [b"mint_request", &request_id],
        bump
    )]
    pub mint_request: Account<'info, MintRequest>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct MintRequest {
    pub request_id: [u8; 32],
    pub mint_amount: u64,
    pub fulfilled: bool,
}

#[event]
pub struct MintEvent {
    pub request_id: [u8; 32],
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}