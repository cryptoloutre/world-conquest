import { ComputeBudgetProgram, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { connection } from "config";

export function shufflePlayers(players: string[]) {
    for (var i = players.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = players[i];
        players[i] = players[j];
        players[j] = temp;
    }

    return players
}

export function getEndPreparationPhase(players: number) {

    let endPhase = 3 * 35;

    if (players == 4) {
        endPhase = 4 * 30
    }
    else if (players == 5) {
        endPhase = 5 * 25
    }
    else if (players == 6) {
        endPhase = 6 * 20
    }

    return endPhase
}

export function getHand(cards: number[]) {
    const cardEquivalence = ["Infantry", "Cavalry", "Artillery"];
    const _hand = [];
    if (cards.length != 0) {
        for (const card of cards) {
            _hand.push(cardEquivalence[card])
        }
    }
    let hand = "";
    if (_hand.length == 0) {
        hand = "0"
    }
    else {
        for (let i = 0; i < _hand.length; i++) {
            hand = hand + _hand[i]
            if (i < _hand.length - 1) {
                hand = hand + ", "
            }
        }
    }

    return hand
}

export function isValidCardsCombinaison(card1: number, card2: number, card3: number, playerCards: number[]) {

    const cards = playerCards;
    let isValid = true;
    const initial_length = cards.length;
    if (!((card1 == card2 && card2 == card3 && card1 <= 2) || (card1 != card2 && card2 != card3 && card1 != card3))) {
        isValid = false
    }

    const index1 = cards.indexOf(card1);
    if (index1 != -1) {
        cards.splice(index1, 1)

    }
    const index2 = cards.indexOf(card2);
    if (index2 != -1) {
        cards.splice(index2, 1)
    }
    const index3 = cards.indexOf(card3);
    if (index3 != -1) {
        cards.splice(index3, 1)
    }
    const final_length = cards.length;

    if (initial_length - final_length != 3) {
        isValid = false
    }

    return isValid
}

export function troopsLost(attackerDiceResult: number[], defenderDiceResult: number[]) {

    let attackerLostTroops = 0;
    let defenderLostTroops = 0;

    const nb_loop = defenderDiceResult.length >= attackerDiceResult.length ? attackerDiceResult.length : defenderDiceResult.length;

    for (let i = 0; i < nb_loop; i++) {
        if (attackerDiceResult[i] <= defenderDiceResult[i]) {
            attackerLostTroops += 1
        }
        else {
            defenderLostTroops += 1
        }
    }


    return { attackerLostTroops, defenderLostTroops }
}


export async function addCULimit(instructions: TransactionInstruction[], user: PublicKey) {

    instructions.push(ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000,
    }),);

    // Get the lates block hash to use on our transaction and confirmation
    let latestBlockhash = await connection.getLatestBlockhash();

    // Create a new TransactionMessage with version and compile it to legacy
    const transactionMessage = new TransactionMessage({
        payerKey: user,
        recentBlockhash: latestBlockhash.blockhash,
        instructions,
    });

    const simulation = await connection.simulateTransaction(transactionMessage.compileToLegacyMessage());
    const units = simulation.value.unitsConsumed;
    transactionMessage.instructions.push(ComputeBudgetProgram.setComputeUnitLimit({ units: units * 1.05 }))

    // Create a new VersionedTransacction which supports legacy and v0
    const transaction = new VersionedTransaction(transactionMessage.compileToLegacyMessage());

    return transaction
}