use anchor_lang::prelude::*;
mod init_hands;
mod init_map;
mod types;
use arrayref::array_ref;
use crate::init_hands::init_hands;
use crate::init_map::init_map;
use crate::types::Hand;
use crate::types::Territorie;
use solana_program::sysvar;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("5envej2Ue7gH2EnBHJsqCEyHrkVPUoyScVb5seHn4p8v");

const TERRITORIES_NUMBER: u64 = 42;

#[program]
mod world_conquest {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.game_id_counter.id = 0;
        ctx.accounts.game_id_counter.bump = ctx.bumps.game_id_counter;
        Ok(())
    }

    pub fn create_game(ctx: Context<CreateGame>, players: Vec<Pubkey>) -> Result<()> {
        // check if the number of players is correct
        assert!(
            (players.len() >= 3 && players.len() <= 6),
            "Incorrect number of players"
        );
        ctx.accounts.game_master.id = ctx.accounts.game_id_counter.id;
        ctx.accounts.game_master.turn_counter = 0;
        ctx.accounts.game_master.bump = ctx.bumps.game_master;
        ctx.accounts.game_master.players = players.clone();
        ctx.accounts.game_master.troops_played = 0;
        ctx.accounts.game_master.troops_to_play = 1;
        let territories_per_player = vec![0; players.len()];
        ctx.accounts.game_master.territories_per_player = territories_per_player;
        ctx.accounts.game_master.all_reinforcements_received = false;
        let map = init_map();
        ctx.accounts.game_master.map = map;
        ctx.accounts.game_master.has_moved_troops = false;
        ctx.accounts.game_master.claim_bonus_counter = 1;
        let hands = init_hands();
        ctx.accounts.game_master.cards_per_player = hands;

        ctx.accounts.game_id_counter.id += 1;

        ctx.accounts.battle.has_battle = false;
        ctx.accounts.battle.has_conquered = false;
        ctx.accounts.battle.bump = ctx.bumps.battle;
        Ok(())
    }

    pub fn deploy_troops(
        ctx: Context<DeployTroops>,
        game_id: u64,
        amount: u8,
        territory: u8,
    ) -> Result<()> {
        let index: u64 =
            ctx.accounts.game_master.turn_counter % (ctx.accounts.game_master.players.len() as u64);
        // check if it's the signer's turn to play
        assert!(
            (ctx.accounts.game_master.players[index as usize] == ctx.accounts.signer.key()),
            "Not your turn to play!"
        );

        // check if the game is not over
        assert!(
            (ctx.accounts.game_master.winner == Pubkey::default()),
            "Can't play, the game is over!"
        );

        // check if there is no battle
        assert!(
            (ctx.accounts.battle.has_battle == false),
            "Can't deploy troops, battle in progress!"
        );

        // check if the amount of reinforcements not exceed the amount allowed
        assert!(
            (amount
                <= ctx.accounts.game_master.troops_to_play
                    - ctx.accounts.game_master.troops_played),
            "Can't deploy troops, exceed reinforcements allowed"
        );

        // check if the signer claimed its bonus reinforcements
        assert!(
            (ctx.accounts.game_master.cards_per_player[index as usize]
                .cards
                .len()
                < 5),
            "Can't deploy troops, you have to claim your bonus reinforcements!"
        );

        if ctx.accounts.game_master.turn_counter < TERRITORIES_NUMBER {
            // check if the territory is free
            assert!(
                (ctx.accounts.game_master.map[territory as usize].ruler == Pubkey::default()),
                "Can't deploy troops here, territory not free!"
            );

            ctx.accounts.game_master.map[territory as usize].ruler = ctx.accounts.signer.key();
            ctx.accounts.game_master.territories_per_player[index as usize] += 1;
        } else {
            // check if the territory belongs to the signer
            assert!(
                (ctx.accounts.game_master.map[territory as usize].ruler
                    == ctx.accounts.signer.key()),
                "Can't deploy troops here, not your territory!"
            );
        }

        ctx.accounts.game_master.map[territory as usize].troops = ctx.accounts.game_master.map
            [territory as usize]
            .troops
            .checked_add(amount)
            .ok_or(ErrorCode::NumberTroopsExceeded)?;
        ctx.accounts.game_master.troops_played += amount;

        if ctx.accounts.game_master.troops_played == ctx.accounts.game_master.troops_to_play {
            ctx.accounts.game_master.all_reinforcements_received = true;
        }

        Ok(())
    }

    pub fn end_turn(ctx: Context<EndTurn>, game_id: u64) -> Result<()> {
        let players_number: u64 = ctx.accounts.game_master.players.len() as u64;
        let turn: u64 = ctx.accounts.game_master.turn_counter;
        let index: u64 = turn % players_number;
        // check if it's the signer's turn to play
        assert!(
            (ctx.accounts.game_master.players[index as usize] == ctx.accounts.signer.key()),
            "Not your turn to play!"
        );

        // check if the game is not over
        assert!(
            (ctx.accounts.game_master.winner == Pubkey::default()),
            "Can't play, the game is over!"
        );

        // check if the player has deployed all its reinforcements
        assert!(
            (ctx.accounts.game_master.all_reinforcements_received == true),
            "Can't end turn, you have to deploy all your reinforcements!"
        );

        // check if there is no battle
        assert!(
            (ctx.accounts.battle.has_battle == false),
            "Can't end turn, battle in progress!"
        );

        if ctx.accounts.game_master.territories_per_player[index as usize] as u64
            == TERRITORIES_NUMBER
        {
            ctx.accounts.game_master.winner = ctx.accounts.game_master.players[index as usize]
        } else {
            let end_preparation_phase: u64 =
                get_end_preparation_phase(&ctx.accounts.game_master.players);
            // increment the offset until a player is found who is not eliminated (ie. number of territories != 0)
            let mut turn_offset: u64 = 1;
            // a player can only be eliminated after the preparation_phase
            if turn >= end_preparation_phase {
                while ctx.accounts.game_master.territories_per_player
                    [((turn + turn_offset) % players_number) as usize]
                    == 0
                {
                    turn_offset += 1
                }
            }

            let next_index: u64 = (turn + turn_offset) % players_number;
            let next_player_territories: u8 =
                ctx.accounts.game_master.territories_per_player[next_index as usize];
            let map: &Vec<Territorie> = &ctx.accounts.game_master.map;
            let next_player: Pubkey = ctx.accounts.game_master.players[next_index as usize];
            let troops_to_play_next_turn: u8 = get_troops_to_play_next_turn(
                end_preparation_phase,
                turn,
                next_player_territories,
                map,
                next_player,
            );

            ctx.accounts.game_master.troops_to_play = troops_to_play_next_turn;
            ctx.accounts.game_master.troops_played = 0;
            ctx.accounts.game_master.turn_counter += turn_offset;
            ctx.accounts.game_master.all_reinforcements_received = false;
            ctx.accounts.game_master.has_moved_troops = false;

            if ctx.accounts.battle.has_conquered == true {
                let recent_slothashes = &ctx.accounts.recent_slothashes;
                let clock = Clock::get()?;
                let unix_timestamp = clock.unix_timestamp as u64;
                let card = get_draw_result(recent_slothashes, unix_timestamp);
                ctx.accounts.game_master.cards_per_player[index as usize]
                    .cards
                    .push(card);
                ctx.accounts.battle.has_conquered = false;
            }
        }

        Ok(())
    }

    pub fn init_battle(
        ctx: Context<InitBattle>,
        game_id: u64,
        from: u8,
        to: u8,
        attacking_troops: u8,
        invading_troops: u8,
    ) -> Result<()> {
        let index: u64 =
            ctx.accounts.game_master.turn_counter % (ctx.accounts.game_master.players.len() as u64);
        // check if it's the signer's turn to play
        assert!(
            (ctx.accounts.game_master.players[index as usize] == ctx.accounts.signer.key()),
            "Not your turn to play!"
        );

        // check if the game is not over
        assert!(
            (ctx.accounts.game_master.winner == Pubkey::default()),
            "Can't play, the game is over!"
        );

        // check if the player has deployed all its reinforcements
        assert!(
            (ctx.accounts.game_master.all_reinforcements_received == true),
            "Can't init battle, you have to deploy all your reinforcements!"
        );

        // check if troops have not been moved
        assert!(
            (ctx.accounts.game_master.has_moved_troops == false),
            "Can't init battle, troops been moved!"
        );

        // check if there is no battle
        assert!(
            (ctx.accounts.battle.has_battle == false),
            "Can't init battle, battle already in progress!"
        );

        let end_preparation_phase: u64 =
            get_end_preparation_phase(&ctx.accounts.game_master.players);
        // check if the preparation phase is completed
        assert!(
            (ctx.accounts.game_master.turn_counter >= end_preparation_phase),
            "Can't init battle, preparation phase not completed!"
        );

        // check if the signer is the ruler of the attacking territory
        assert!(
            (ctx.accounts.game_master.map[from as usize].ruler == ctx.accounts.signer.key()),
            "Can't init battle, signer not the ruler of the attacking territory!"
        );

        // check if the signer is not the ruler of the attacked territory
        assert!(
            (ctx.accounts.game_master.map[from as usize].ruler
                != ctx.accounts.game_master.map[to as usize].ruler),
            "Can't init battle, you are attacking your own territory!"
        );

        // check if the defending and attacking territories border each other
        assert!(
            (ctx.accounts.game_master.map[from as usize]
                .borders
                .iter()
                .any(|&value| value == to)),
            "Can't init battle, the defending and attacking territories doesn't border each other!"
        );

        // check if the number of attacking troops is allowed
        assert!(
            (attacking_troops >= 1 && attacking_troops <= ctx.accounts.game_master.map[from as usize].troops - 1 && attacking_troops <= 3),
            "Can't init battle, number of attacking troops is not allowed (one troop has to stay in the territory, min 1 and max 3)!"
        );

        // check if the number of invading troops is allowed
        assert!(
            (invading_troops >= 1 && invading_troops <= ctx.accounts.game_master.map[from as usize].troops - 1),
            "Can't init battle, number of invading troops is not allowed (one troop has to stay in the territory and min 1)!"
        );

        ctx.accounts.battle.attacker = ctx.accounts.signer.key();
        ctx.accounts.battle.defender = ctx.accounts.game_master.map[to as usize].ruler;
        ctx.accounts.battle.attacker_troops = attacking_troops;
        ctx.accounts.battle.invasion_troops = invading_troops;
        ctx.accounts.battle.attacking_territory = from;
        ctx.accounts.battle.attacked_territory = to;
        ctx.accounts.battle.has_battle = true;
        ctx.accounts.battle.attacker_dice_result = vec![];
        ctx.accounts.battle.defender_dice_result = vec![];

        Ok(())
    }

    pub fn resolve_battle(
        ctx: Context<ResolveBattle>,
        game_id: u64,
        defending_troops: u8,
    ) -> Result<()> {
        // check if the game is not over
        assert!(
            (ctx.accounts.game_master.winner == Pubkey::default()),
            "Can't play, the game is over!"
        );

        // check if a battle is initialized
        assert!(
            (ctx.accounts.battle.has_battle == true),
            "Can't resolve battle, battle not in progress!"
        );

        // check if the signer is the defender
        assert!(
            (ctx.accounts.battle.defender == ctx.accounts.signer.key()),
            "Can't resolve battle, signer not the ruler of the defending territory!"
        );

        let attacked_territory: u8 = ctx.accounts.battle.attacked_territory;
        // check if the number of defending troops is allowed
        assert!(
            (defending_troops >= 1
                && defending_troops <= 2
                && defending_troops
                    <= ctx.accounts.game_master.map[attacked_territory as usize].troops),
            "Can't resolve battle, number of defending troops is not allowed (min 1 and max 2)!"
        );

        ctx.accounts.battle.defender_troops = defending_troops;

        let recent_slothashes = &ctx.accounts.recent_slothashes;
        let clock = Clock::get()?;
        let unix_timestamp = clock.unix_timestamp as u64;

        let attacker_dice_result: Vec<u8> = get_dice_result(
            recent_slothashes,
            unix_timestamp,
            ctx.accounts.battle.attacker_troops,
            0,
        );
        ctx.accounts.battle.attacker_dice_result = attacker_dice_result.clone();
        let defender_dice_result: Vec<u8> = get_dice_result(
            recent_slothashes,
            unix_timestamp,
            ctx.accounts.battle.defender_troops,
            3,
        );
        ctx.accounts.battle.defender_dice_result = defender_dice_result.clone();
        let attacking_territory: u8 = ctx.accounts.battle.attacking_territory;

        let mut nb_loop = 0;
        if (ctx.accounts.battle.defender_troops >= ctx.accounts.battle.attacker_troops) {
            nb_loop = ctx.accounts.battle.attacker_troops
        } else {
            nb_loop = ctx.accounts.battle.defender_troops
        }

        for n in 0..nb_loop {
            if attacker_dice_result[n as usize] <= defender_dice_result[n as usize] {
                ctx.accounts.game_master.map[attacking_territory as usize].troops -= 1;
            } else {
                ctx.accounts.game_master.map[attacked_territory as usize].troops -= 1;
            }
        }

        if ctx.accounts.game_master.map[attacked_territory as usize].troops == 0 {
            ctx.accounts.game_master.map[attacked_territory as usize].ruler =
                ctx.accounts.game_master.map[attacking_territory as usize].ruler;
            ctx.accounts.game_master.map[attacked_territory as usize].troops =
                ctx.accounts.battle.invasion_troops;
            ctx.accounts.game_master.map[attacking_territory as usize].troops -=
                ctx.accounts.battle.invasion_troops;
            let attacked_player_index = ctx
                .accounts
                .game_master
                .players
                .iter()
                .position(|&value| value == ctx.accounts.battle.defender)
                .unwrap();
            ctx.accounts.game_master.territories_per_player[attacked_player_index] -= 1;
            let attacking_player_index = ctx
                .accounts
                .game_master
                .players
                .iter()
                .position(|&value| value == ctx.accounts.battle.attacker)
                .unwrap();
            ctx.accounts.game_master.territories_per_player[attacking_player_index] += 1;
            if ctx.accounts.battle.has_conquered == false {
                ctx.accounts.battle.has_conquered = true
            }
        }
        ctx.accounts.battle.has_battle = false;

        Ok(())
    }

    pub fn moove_troops(
        ctx: Context<MooveTroops>,
        game_id: u64,
        from: u8,
        to: u8,
        mooving_troops: u8,
    ) -> Result<()> {
        let index: u64 =
            ctx.accounts.game_master.turn_counter % (ctx.accounts.game_master.players.len() as u64);
        // check if it's the signer's turn to play
        assert!(
            (ctx.accounts.game_master.players[index as usize] == ctx.accounts.signer.key()),
            "Not your turn to play!"
        );

        // check if the game is not over
        assert!(
            (ctx.accounts.game_master.winner == Pubkey::default()),
            "Can't play, the game is over!"
        );

        // check if the player has deployed all its reinforcements
        assert!(
            (ctx.accounts.game_master.all_reinforcements_received == true),
            "Can't moove troops, you have to deploy all your reinforcements!"
        );

        // check if there is no battle
        assert!(
            (ctx.accounts.battle.has_battle == false),
            "Can't moove troops, battle in progress!"
        );

        let end_preparation_phase: u64 =
            get_end_preparation_phase(&ctx.accounts.game_master.players);
        // check if the preparation phase is completed
        assert!(
            (ctx.accounts.game_master.turn_counter >= end_preparation_phase),
            "Can't moove troops, preparation phase not completed!"
        );

        // check if the signer is the ruler of the departure territory
        assert!(
            (ctx.accounts.game_master.map[from as usize].ruler == ctx.accounts.signer.key()),
            "Can't moove troops, signer not the ruler of the departure territory!"
        );

        // check if the signer is the ruler of the destination territory
        assert!(
            (ctx.accounts.game_master.map[to as usize].ruler == ctx.accounts.signer.key()),
            "Can't moove troops, signer not the ruler of the destination territory!"
        );

        // check if the departure and destination territories border each other
        assert!(
            (ctx.accounts.game_master.map[from as usize].borders.iter().any(|&value| value == to)),
            "Can't moove troops, the departure and destination territories doesn't border each other!"
        );

        // check if the number of mooving troops is allowed
        assert!(
            (mooving_troops >= 1
                && mooving_troops <= ctx.accounts.game_master.map[from as usize].troops - 1),
            "Can't resolve battle, number of defending troops is not allowed (min 1 and max 2)!"
        );

        ctx.accounts.game_master.map[from as usize].troops -= mooving_troops;
        ctx.accounts.game_master.map[to as usize].troops = ctx.accounts.game_master.map
            [to as usize]
            .troops
            .checked_add(mooving_troops)
            .ok_or(ErrorCode::NumberTroopsExceeded)?;
        ctx.accounts.game_master.has_moved_troops = true;

        Ok(())
    }

    pub fn claim_bonus_reinforcements(
        ctx: Context<ClaimBonusReinforcements>,
        game_id: u64,
        card1: u8,
        card2: u8,
        card3: u8,
    ) -> Result<()> {
        let index: u64 =
            ctx.accounts.game_master.turn_counter % (ctx.accounts.game_master.players.len() as u64);
        // check if it's the signer's turn to play
        assert!(
            (ctx.accounts.game_master.players[index as usize] == ctx.accounts.signer.key()),
            "Not your turn to play!"
        );

        // check if the game is not over
        assert!(
            (ctx.accounts.game_master.winner == Pubkey::default()),
            "Can't play, the game is over!"
        );

        // check if there is no battle
        assert!(
            (ctx.accounts.battle.has_battle == false),
            "Can't claim more troops, battle in progress!"
        );

        // check if the player has not deployed all its reinforcements (ie. we are at the beginning of the turn)
        assert!(
            (ctx.accounts.game_master.all_reinforcements_received == false),
            "Can't claim more troops, not the beginning of the turn!"
        );

        // check if the combinaison of cards is allowed
        // 0: infantry, 1: cavalry, 2: artillery
        // one of each or the same 3 cards
        assert!(
            (card1 <= 2
                && card2 <= 2
                && card3 <= 2
                && ((card1 == card2 && card2 == card3)
                    || (card1 != card2 && card2 != card3 && card1 != card3))),
            "Can't claim more troops, invalid combinaison!"
        );

        let mut game_master_mut = ctx.accounts.game_master.clone();
        let cards: &mut Vec<u8> = &mut game_master_mut.cards_per_player[index as usize].cards;
        let initial_card_number = cards.len();

        if let Some(index) = cards.iter().position(|value| *value == card1) {
            cards.swap_remove(index);
        }

        if let Some(index) = cards.iter().position(|value| *value == card2) {
            cards.swap_remove(index);
        }

        if let Some(index) = cards.iter().position(|value| *value == card3) {
            cards.swap_remove(index);
        }

        let final_card_number = cards.len();

        if initial_card_number - final_card_number == 3 {
            let game_master = ctx.accounts.game_master.clone();
            let bonus: u8 = get_bonus_reinforcements_number(game_master.claim_bonus_counter);
            ctx.accounts.game_master.troops_to_play += bonus;
            ctx.accounts.game_master.cards_per_player[index as usize].cards = cards.to_vec();
            ctx.accounts.game_master.claim_bonus_counter += 1;
        } else {
            return Err(error!(ErrorCode::InvalidCardsCombinaison));
        }

        Ok(())
    }
}

fn get_end_preparation_phase(players: &Vec<Pubkey>) -> u64 {
    let mut end_preparation_phase: u64 = 3 * 35;

    if players.len() == 4 {
        end_preparation_phase = 4 * 30;
    } else if players.len() == 5 {
        end_preparation_phase = 5 * 25;
    } else if players.len() == 6 {
        end_preparation_phase = 6 * 20;
    }

    return end_preparation_phase;
}

fn get_draw_result(hash: &UncheckedAccount, timestamp: u64) -> u8 {
    let data = hash.data.borrow();
    let most_recent = array_ref![data, 12, 8];
    let seed = u64::from_le_bytes(*most_recent).saturating_sub(timestamp);
    let result: u8 = (seed.rem_euclid(3)) as u8;
    return result;
}

fn get_dice_result(
    hash: &UncheckedAccount,
    timestamp: u64,
    roll_number: u8,
    offset: u8,
) -> Vec<u8> {
    let mut dice_result: Vec<u8> = vec![];

    let data = hash.data.borrow();
    let most_recent = array_ref![data, 12, 8];
    let seed = u64::from_le_bytes(*most_recent).saturating_sub(timestamp);
    for n in 0..roll_number {
        let string = seed.to_string();
        let born_inf = ((n + offset) * 3) as usize;
        let born_supp = ((n + 1 + offset) * 3) as usize;
        let word = &string[born_inf..born_supp];
        let result: u8 = (word.as_bytes())[0].rem_euclid(6) as u8;
        dice_result.push(result)
    }
    dice_result.sort();
    dice_result.reverse();
    return dice_result;
}

fn get_troops_to_play_next_turn(
    end_preparation_phase: u64,
    turn: u64,
    territories: u8,
    map: &Vec<Territorie>,
    player: Pubkey,
) -> u8 {
    let mut troops: u8 = 0;

    if turn + 1 < end_preparation_phase {
        troops = 1
    } else {
        if territories / 3 >= 3 {
            troops = territories / 3
        } else {
            troops = 3
        }

        // Australia  bonus
        if map[38].ruler == player
            && map[39].ruler == player
            && map[40].ruler == player
            && map[41].ruler == player
        {
            troops += 2
        }

        // South America  bonus
        if map[9].ruler == player
            && map[10].ruler == player
            && map[11].ruler == player
            && map[12].ruler == player
        {
            troops += 2
        }

        // Africa  bonus
        if map[20].ruler == player
            && map[21].ruler == player
            && map[22].ruler == player
            && map[23].ruler == player
            && map[24].ruler == player
            && map[25].ruler == player
        {
            troops += 3
        }

        // North America  bonus
        if map[0].ruler == player
            && map[1].ruler == player
            && map[2].ruler == player
            && map[3].ruler == player
            && map[4].ruler == player
            && map[5].ruler == player
            && map[6].ruler == player
            && map[7].ruler == player
            && map[8].ruler == player
        {
            troops += 5
        }

        // Europe  bonus
        if map[13].ruler == player
            && map[14].ruler == player
            && map[15].ruler == player
            && map[16].ruler == player
            && map[17].ruler == player
            && map[18].ruler == player
            && map[19].ruler == player
        {
            troops += 5
        }

        // Asia  bonus
        if map[26].ruler == player
            && map[27].ruler == player
            && map[28].ruler == player
            && map[29].ruler == player
            && map[30].ruler == player
            && map[31].ruler == player
            && map[32].ruler == player
            && map[33].ruler == player
            && map[34].ruler == player
            && map[35].ruler == player
            && map[36].ruler == player
            && map[37].ruler == player
        {
            troops += 7
        }
    };

    return troops;
}

fn get_bonus_reinforcements_number(counter: u8) -> u8 {
    let bonus: u8 = if counter < 6 {
        2 * (counter + 1)
    } else {
        5 * counter - 15
    };

    return bonus;
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8 + 1, seeds = [b"GAME_COUNTER"], bump)]
    pub game_id_counter: Account<'info, GameIdCounter>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateGame<'info> {
    #[account(mut, seeds = [b"GAME_COUNTER"], bump = game_id_counter.bump)]
    pub game_id_counter: Account<'info, GameIdCounter>,
    #[account(init, payer = signer, space = 8 + GameMaster::MAX_SIZE, seeds = [b"GAME_MASTER", (game_id_counter.id).to_be_bytes().as_ref()], bump)]
    pub game_master: Account<'info, GameMaster>,
    #[account(init, payer = signer, space = 8 + Battle::MAX_SIZE, seeds = [b"BATTLE", game_master.key().as_ref()], bump)]
    pub battle: Account<'info, Battle>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct DeployTroops<'info> {
    #[account(mut, seeds = [b"GAME_MASTER", (game_id).to_be_bytes().as_ref()], bump = game_master.bump)]
    pub game_master: Account<'info, GameMaster>,
    #[account(seeds = [b"BATTLE", game_master.key().as_ref()], bump = battle.bump)]
    pub battle: Account<'info, Battle>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct EndTurn<'info> {
    #[account(mut, seeds = [b"GAME_MASTER", (game_id).to_be_bytes().as_ref()], bump = game_master.bump)]
    pub game_master: Account<'info, GameMaster>,
    #[account(mut, seeds = [b"BATTLE", game_master.key().as_ref()], bump = battle.bump)]
    pub battle: Account<'info, Battle>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::slot_hashes::id())]
    recent_slothashes: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct InitBattle<'info> {
    #[account(seeds = [b"GAME_MASTER", (game_id).to_be_bytes().as_ref()], bump = game_master.bump)]
    pub game_master: Account<'info, GameMaster>,
    #[account(mut, seeds = [b"BATTLE", game_master.key().as_ref()], bump = battle.bump)]
    pub battle: Account<'info, Battle>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct ResolveBattle<'info> {
    #[account(mut, seeds = [b"GAME_MASTER", (game_id).to_be_bytes().as_ref()], bump = game_master.bump)]
    pub game_master: Account<'info, GameMaster>,
    #[account(mut, seeds = [b"BATTLE", game_master.key().as_ref()], bump = battle.bump)]
    pub battle: Account<'info, Battle>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: account constraints checked in account trait
    #[account(address = sysvar::slot_hashes::id())]
    recent_slothashes: UncheckedAccount<'info>,
}

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct MooveTroops<'info> {
    #[account(mut, seeds = [b"GAME_MASTER", (game_id).to_be_bytes().as_ref()], bump = game_master.bump)]
    pub game_master: Account<'info, GameMaster>,
    #[account(seeds = [b"BATTLE", game_master.key().as_ref()], bump = battle.bump)]
    pub battle: Account<'info, Battle>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(game_id: u64)]
pub struct ClaimBonusReinforcements<'info> {
    #[account(mut, seeds = [b"GAME_MASTER", (game_id).to_be_bytes().as_ref()], bump = game_master.bump)]
    pub game_master: Account<'info, GameMaster>,
    #[account(seeds = [b"BATTLE", game_master.key().as_ref()], bump = battle.bump)]
    pub battle: Account<'info, Battle>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct GameIdCounter {
    id: u64,
    bump: u8,
}

#[account]
pub struct GameMaster {
    id: u64,
    players: Vec<Pubkey>, // we want to support up to 6 players
    winner: Pubkey,
    turn_counter: u64,
    troops_to_play: u8,
    troops_played: u8,
    territories_per_player: Vec<u8>,
    all_reinforcements_received: bool,
    bump: u8,
    map: Vec<Territorie>, // 42 Territories
    has_moved_troops: bool,
    claim_bonus_counter: u8,
    cards_per_player: Vec<Hand>, // we want to support up to 6 players and a hand is up to 5 cards -> 4 + 6 * (4 + 5 * 1)
}

impl GameMaster {
    pub const MAX_SIZE: usize = 8
        + (4 + 6 * 32)
        + 32
        + 8
        + 1
        + 1
        + (4 + 6 * 1)
        + 1
        + 1
        + (4 + 42 * 43)
        + 1
        + 1
        + 4
        + 6 * (4 + 5 * 1);
}
#[account]
pub struct Battle {
    has_battle: bool,
    attacker: Pubkey,
    attacking_territory: u8,
    attacker_troops: u8,
    invasion_troops: u8,
    defender: Pubkey,
    defender_troops: u8,
    attacked_territory: u8,
    bump: u8,
    attacker_dice_result: Vec<u8>,
    defender_dice_result: Vec<u8>,
    has_conquered: bool,
}

impl Battle {
    pub const MAX_SIZE: usize = 1 + 32 + 1 + 1 + 1 + 32 + 1 + 1 + 1 + (4 + 3 * 1) + (4 + 2 * 1) + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("You can't have more troops on this territory (max 255)")]
    NumberTroopsExceeded,
    #[msg("You can't claim bonus, you don't have the necessary cards")]
    InvalidCardsCombinaison,
}