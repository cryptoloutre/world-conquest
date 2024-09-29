use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct Territorie {
    pub troops: u8, 
    pub ruler: Pubkey,
    pub borders: Vec<u8>
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct Hand {
    pub cards: Vec<u8>
}
