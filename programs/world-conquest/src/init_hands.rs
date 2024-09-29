use anchor_lang::prelude::*;
use crate::types::Hand;

pub fn init_hands() -> Vec<Hand> {
    let hands = vec![
        Hand {
            cards: vec![],
        };
        6
    ];
    return hands;
}