import { BN, Program } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { ComputeBudgetProgram, LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_SLOT_HASHES_PUBKEY, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { connection, PROGRAM_ID } from 'config';
import { IDL } from 'idl/idl';
import { MoveLeftIcon, PartyPopperIcon, SwordsIcon, TrophyIcon, XIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { notify } from 'utils/notifications';
import { addCULimit, getEndPreparationPhase, getHand, isValidCardsCombinaison, troopsLost } from 'utils/gameUtils';
import { shortAddress } from 'utils/shortAddress';
import { ContinentBonusInfos } from './continentBonusInfo';
import { Loader } from 'components/Loader';
import { DiceResults } from './diceResults';
import { Attack } from './actions/attack';
import { Move } from './actions/move';
import { Deploy } from './actions/deploy';

interface Props {
    gameAddress: String;
    setGameAddress: Dispatch<SetStateAction<String>>
}

export const Game: React.FC<Props> = ({ gameAddress, setGameAddress }) => {
    const gameMaster = new PublicKey(gameAddress);
    const [battle] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("BATTLE"),
            gameMaster.toBuffer()
        ],
        PROGRAM_ID
    );

    const { publicKey, sendTransaction, wallet } = useWallet();
    const program = new Program(IDL, PROGRAM_ID, { connection });
    const [SOLBalance, setSOLBalance] = useState<number>();
    const [playersInfos, setPlayersInfos] = useState<{ address: string, territoriesNumber: number, textColor: string, bgColor: string, bonusCards: number[] }[]>(null);
    const [currentPlayer, setCurrentPlayer] = useState<string>(null);
    const [winner, setWinner] = useState<string>(null);
    const [mapInfos, setMapInfos] = useState(null);
    const [endPreparationPhase, setEndPreparationPhase] = useState(null);
    const [turnCounter, setTurnCounter] = useState(1);
    const [bonusReinforcements, setBonusReinforcements] = useState(1);
    const [card1, setCard1] = useState(9);
    const [card2, setCard2] = useState(9);
    const [card3, setCard3] = useState(9);
    const [troopsToPlay, setTroopsToPlay] = useState(0);
    const [troopsPlayed, setTroopsPlayed] = useState(0);
    const [defendingTroops, setDefendingTroops] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [error, setError] = useState<string>(null);
    const [displayManagePanel, setDisplayManagePanel] = useState(false);
    const [displayBattlePanel, setDisplayBattlePanel] = useState(false);
    const [displayClaimBonusPanel, setDisplayClaimBonusPanel] = useState(false);
    const [displayWinnerPanel, setDisplayWinnerPanel] = useState(false);
    const [fromTerritory, setFromTerritory] = useState<number>(null);
    const [battleInfos, setBattleInfos] = useState<{
        hasBattle: boolean,
        attacker: string,
        defender: string,
        attackerTroops: number,
        defenderTroops: number,
        attackingTerritory: number,
        attackedTerritory: number,
        attackerDiceResult: number[],
        defenderDiceResult: number[],
        hasConquered: boolean,
        invasionTroops: number
    }>(null);
    const [action, setAction] = useState<string>('deploy');

    const bgColors = [
        'bg-[#b1b1ff]', //blue
        'bg-[#fece00]', //orange
        'bg-[#FF0000]', //red
        'bg-[#008000]', // green
        'bg-[#FFC0CB]', // pink
        'bg-[#9945FF]', // purple
    ]

    const textColors = [
        'text-[#b1b1ff]', //blue
        'text-[#fece00]', //orange
        'text-[#FF0000]', //red
        'text-[#008000]', // green
        'text-[#FFC0CB]', // pink
        'text-[#9945FF]', // purple
    ]

    async function getUserSolBalance() {
        const SOLBalance = await connection.getBalance(
            publicKey,
            'confirmed'
        );

        setSOLBalance(SOLBalance)
    }

    useEffect(() => {
        if (publicKey) {
            getUserSolBalance();
        }
    }, [publicKey]);

    useEffect(() => {
        if (publicKey) {
            getBattleInfos();
        }
    }, [publicKey]);

    async function getBattleInfos() {
        console.log("Game address", gameAddress);
        // @ts-ignore
        const gameMasterInfos = await program.account.gameMaster.fetch(gameMaster);
        const players = gameMasterInfos.players.map((player) => player.toBase58());
        const bonusCards = gameMasterInfos.cardsPerPlayer.map((hand) => Array.from(hand.cards));
        const winner = gameMasterInfos.winner.toBase58();
        if (winner != PublicKey.default.toBase58()) {
            setWinner(winner);
            setDisplayWinnerPanel(true);
        }
        const endPreparationPhase = getEndPreparationPhase(players.length);
        const bonusCounter = gameMasterInfos.claimBonusCounter;
        if (bonusCounter < 6) {
            setBonusReinforcements(2 * (bonusCounter + 1));
        }
        else {
            setBonusReinforcements(5 * bonusCounter - 15);
        }
        setEndPreparationPhase(endPreparationPhase);
        const territoriesPerPlayers = gameMasterInfos.territoriesPerPlayer;
        const map = gameMasterInfos.map;
        console.log(gameMasterInfos)
        const turnCounter = Number(gameMasterInfos.turnCounter);
        setTurnCounter(turnCounter);
        setGameId(Number(gameMasterInfos.id));
        setTroopsToPlay(gameMasterInfos.troopsToPlay);
        setTroopsPlayed(gameMasterInfos.troopsPlayed);

        const _playersInfos = [];
        for (let i = 0; i < players.length; i++) {
            _playersInfos.push({
                address: players[i],
                territoriesNumber: territoriesPerPlayers[i],
                bgColor: bgColors[i],
                textColor: textColors[i],
                bonusCards: bonusCards[i]
            })
        }

        const indexToPlay = turnCounter % _playersInfos.length;
        const playerToPlayAddress = _playersInfos[indexToPlay].address;
        setCurrentPlayer(playerToPlayAddress);
        setPlayersInfos(_playersInfos);
        setMapInfos(map);
        console.log(_playersInfos);
        console.log(map);
        if (turnCounter >= endPreparationPhase) {
            // @ts-ignore
            const battleData = await program.account.battle.fetch(battle);
            console.log("battleData", battleData);
            const attackerDiceResult: number[] = Array.from(battleData.attackerDiceResult)
            const defenderDiceResult: number[] = Array.from(battleData.defenderDiceResult)
            const battleInfos = {
                hasBattle: battleData.hasBattle,
                attacker: battleData.attacker.toBase58(),
                defender: battleData.defender.toBase58(),
                attackerTroops: battleData.attackerTroops,
                defenderTroops: battleData.defenderTroops,
                attackingTerritory: battleData.attackingTerritory,
                attackedTerritory: battleData.attackedTerritory,
                attackerDiceResult: attackerDiceResult,
                defenderDiceResult: defenderDiceResult,
                hasConquered: battleData.hasConquered,
                invasionTroops: battleData.invasionTroops
            }
            setBattleInfos(battleInfos);
            if (battleData.hasBattle) {
                setDisplayBattlePanel(true)
            }
        }
    }

    useEffect(() => {
        if (!publicKey) { return; }
        connection.onAccountChange(gameMaster, (accountInfo) => {
            const decoded = program.coder.accounts.decode(
                "GameMaster",
                accountInfo.data
            );
            const players = decoded.players.map((player) => player.toBase58());
            const bonusCards = decoded.cardsPerPlayer.map((hand) => Array.from(hand.cards));
            const winner = decoded.winner.toBase58();
            if (winner != PublicKey.default.toBase58()) {
                setWinner(winner);
                setDisplayWinnerPanel(true);
            }
            const endPreparationPhase = getEndPreparationPhase(players.length);
            const bonusCounter = decoded.claimBonusCounter;
            if (bonusCounter < 6) {
                setBonusReinforcements(2 * (bonusCounter + 1));
            }
            else {
                setBonusReinforcements(5 * bonusCounter - 15);
            }
            setEndPreparationPhase(endPreparationPhase);
            const territoriesPerPlayers = decoded.territoriesPerPlayer;
            const map = decoded.map;
            const turnCounter = Number(decoded.turnCounter);
            setTurnCounter(turnCounter);
            setGameId(Number(decoded.id));
            setTroopsToPlay(decoded.troopsToPlay);
            setTroopsPlayed(decoded.troopsPlayed);

            const _playersInfos = [];
            for (let i = 0; i < players.length; i++) {
                _playersInfos.push({
                    address: players[i],
                    territoriesNumber: territoriesPerPlayers[i],
                    bgColor: bgColors[i],
                    textColor: textColors[i],
                    bonusCards: bonusCards[i]
                })
            }

            const indexToPlay = turnCounter % _playersInfos.length;
            const playerToPlayAddress = _playersInfos[indexToPlay].address;
            setCurrentPlayer(playerToPlayAddress);
            setPlayersInfos(_playersInfos);
            setMapInfos(map);
            console.log(_playersInfos);
            console.log(map);

        }, "confirmed");
    });

    useEffect(() => {
        if (!publicKey) { return; }
        connection.onAccountChange(battle, (accountInfo) => {
            const decoded = program.coder.accounts.decode(
                "Battle",
                accountInfo.data
            );
            console.log("battleData", decoded);
            const attackerDiceResult: number[] = Array.from(decoded.attackerDiceResult)
            const defenderDiceResult: number[] = Array.from(decoded.defenderDiceResult)
            const battleInfos = {
                hasBattle: decoded.hasBattle,
                attacker: decoded.attacker.toBase58(),
                defender: decoded.defender.toBase58(),
                attackerTroops: decoded.attackerTroops,
                defenderTroops: decoded.defenderTroops,
                attackingTerritory: decoded.attackingTerritory,
                attackedTerritory: decoded.attackedTerritory,
                attackerDiceResult: attackerDiceResult,
                defenderDiceResult: defenderDiceResult,
                hasConquered: decoded.hasConquered,
                invasionTroops: decoded.invasionTroops
            }
            setBattleInfos(battleInfos);
            if (decoded.hasBattle) {
                setDisplayBattlePanel(true)
            }
        }, "confirmed");
    });

    const claimBonus = async (card1: number, card2: number, card3: number) => {

        console.log("combinaison", card1, card2, card3)
        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        if (publicKey.toBase58() != currentPlayer) {
            notify({ type: 'error', message: `Not tour turn to play!` });
            console.log('error', `Send Transaction: Not tour turn to play!`);
            return;
        }

        const playerCards = (playersInfos.find((player) => player.address == publicKey.toBase58())).bonusCards;

        if (!isValidCardsCombinaison(card1, card2, card3, playerCards)) {
            notify({ type: 'error', message: `Invalid Combinaison!` });
            console.log('error', `Send Transaction: Invalid Combinaison!`);
            return;
        }

        try {
            if (SOLBalance <= 0.1 * LAMPORTS_PER_SOL) {
                await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)
            }
            const claimBonusReinforcementsIx = await program.methods
                .claimBonusReinforcements(new BN(gameId), card1, card2, card3)
                .accounts({
                    gameMaster: gameMaster,
                    battle: battle,
                    signer: publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .instruction();

            const transaction = await addCULimit([claimBonusReinforcementsIx], publicKey)

            // Send transaction and await for signature
            const signature = await sendTransaction(transaction, connection, { skipPreflight: true });
            notify({ type: 'success', message: `Bonus claimed!` });
            console.log(signature);

        }
        catch (error) {
            const err = (error as any)?.message;
            console.log(err);
            notify({ type: 'error', message: err });
        }
    }

    const resolveBattle = async (defending: number) => {

        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        if (publicKey.toBase58() != battleInfos.defender) {
            notify({ type: 'error', message: `Not tour turn to play!` });
            console.log('error', `Send Transaction: Not tour turn to play!`);
            return;
        }

        try {
            if (SOLBalance <= 0.1 * LAMPORTS_PER_SOL) {
                await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)
            }
            const resolveBattleIx = await program.methods
                .resolveBattle(new BN(gameId), defending)
                .accounts({
                    gameMaster: gameMaster,
                    signer: publicKey,
                    battle: battle,
                    systemProgram: SystemProgram.programId,
                    recentSlothashes: SYSVAR_SLOT_HASHES_PUBKEY
                })
                .instruction();

            const transaction = await addCULimit([resolveBattleIx], publicKey);

            // Send transaction and await for signature
            const signature = await sendTransaction(transaction, connection);
            notify({ type: 'success', message: `Battle resolved!` });

            console.log(signature);

        }
        catch (error) {
            const err = (error as any)?.message;
            console.log(err);
            notify({ type: 'error', message: err });
        }
    }

    const endTurn = async () => {

        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        if (publicKey.toBase58() != currentPlayer) {
            notify({ type: 'error', message: `Not tour turn to play!` });
            console.log('error', `Send Transaction: Not tour turn to play!`);
            return;
        }

        if (troopsPlayed != troopsToPlay) {
            notify({ type: 'error', message: `Deploy troops first!` });
            console.log('error', `Send Transaction: Deploy troops first!`);
            return;
        }

        try {
            if (SOLBalance <= 0.1 * LAMPORTS_PER_SOL) {
                await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)
            }
            const endTurnIx = await program.methods
                .endTurn(new BN(gameId))
                .accounts({
                    gameMaster: gameMaster,
                    battle: battle,
                    signer: publicKey,
                    systemProgram: SystemProgram.programId,
                    recentSlothashes: SYSVAR_SLOT_HASHES_PUBKEY
                })
                .instruction();

            const transaction = await addCULimit([endTurnIx], publicKey);

            // Send transaction and await for signature
            const signature = await sendTransaction(transaction, connection);
            notify({ type: 'success', message: `Turn ended` });
            console.log(signature);

        }
        catch (error) {
            const err = (error as any)?.message;
            console.log(err);
            notify({ type: 'error', message: err });
        }
    }
    return (
        <div className="md:hero mx-auto">
            <div className="md:hero-content flex flex-col">
                <button onClick={() => setGameAddress("")} className='flex space-x-2 bg-[#312d29] border border-[#c8ab6e] py-1 px-3 rounded-lg uppercase font-bold'>
                    <MoveLeftIcon />
                    <div>back</div>
                </button>
                {playersInfos &&
                    <div>
                        <div className={`grid gap-2 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3`}>
                            {playersInfos.map((playerInfo, key) => {
                                const playerHand = getHand(playerInfo.bonusCards);
                                return (
                                    <Card key={key} className={`${playerInfo.address == currentPlayer ? "border-4 border-[#45f248]" : "border-secondary"}`}>
                                        <CardHeader>
                                            <CardTitle className="">
                                                <span className="block font-bold group-hover:text-pretty">
                                                    Player: {shortAddress(playerInfo.address)}
                                                </span>

                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className='flex items-center text-center'>
                                                <span className={`${playerInfo.bgColor} h-[1em] w-[1em] mx-2`}></span> Territories conquered: {playerInfo.territoriesNumber}
                                            </div>
                                            <div className='mx-2 mt-2'>Bonus Cards: {playerHand}</div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                        <div className='flex justify-center mt-4 text-lg font-bold justify-around'>
                            <div className='py-1 px-3'>Next Bonus: {bonusReinforcements}</div>
                            <button onClick={() => setDisplayClaimBonusPanel(!displayClaimBonusPanel)} className='bg-[#312d29] border border-[#c8ab6e] py-1 px-3 rounded-lg'>Claim Bonus Troops</button>
                        </div>
                        <div className='flex justify-center mt-4 text-lg font-bold justify-around'>
                            <div className='py-1 px-3'>Turn: {turnCounter + 1}</div>
                            <button onClick={endTurn} className='bg-[#312d29] border border-[#c8ab6e] py-1 px-3 rounded-lg'>End Turn</button>
                        </div>
                        <div className='flex justify-center mt-2 text-lg font-bold justify-around'>
                            <div className='py-1 px-3'>Troops Played: {troopsPlayed}</div>
                            <div className='py-1 px-3'>Troops To Play: {troopsToPlay}</div>
                        </div>
                        <div className='mt-4 z-0 relative'>
                            <div className='grid grid-cols-21'>
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 0 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-4 border-r-2 border-white font-bold`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 1 && <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-span-3 border-t-4 border-r-2 border-white`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 2 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-4 border-r-4 col-span-2 border-white`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 13 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-4 border-l-4 border-r-2 border-[#B65805] col-span-2`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 14 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-4 border-r-2 border-[#B65805] col-span-4`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 15 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-4 border-r-4 border-[#B65805]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 26 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-4 border-r-2 border-l-4 col-span-2 border-[#02D8E9]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 27 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-4 border-r-2 col-span-2 border-[#02D8E9]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 28 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-4 border-r-2 border-[#02D8E9]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 29 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-4 border-r-4 col-span-2 border-[#02D8E9]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 0 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-y-4 border-l-4 col-span-1 border-white`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 3 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-l-4 border-r-2 col-start-1 col-end-3 border-white`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 4 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-r-2 col-span-3 border-white`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 5 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-r-4 border-white`}>{key}</button>
                                    )
                                })}
                                <div className={`p-2 border-t-4 border-[#B65805]`}></div>
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 16 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-l-4 border-r-2 border-[#B65805] col-start-8 col-span-2`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 17 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-r-2 border-[#B65805] col-span-3`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 15 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-r-4 border-[#B65805]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 26 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-l-4 border-r-2 col-span-2 border-[#02D8E9]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 27 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-r-2 col-span-2 border-[#02D8E9]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 30 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-r-2 border-[#02D8E9] col-span-1`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 29 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-r-4 col-span-2 border-[#02D8E9]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 6 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-span-3 border-t-2 border-b-4 border-l-4 border-r-2 border-white`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 7 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-span-3 border-t-2 border-b-4 border-r-4 border-white`}>{key}</button>
                                    )
                                })}
                                <div className={`p-2 border-t-4 border-[#B65805] col-start-8`}></div>
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 18 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-b-4 border-l-4 border-r-2 border-[#B65805] col-start-9 col-span-2`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 19 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-r-2 border-[#B65805] col-span-2`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 15 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-r-4 border-[#B65805]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 31 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-l-4 border-[#02D8E9]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 32 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-x-2 border-[#02D8E9] col-span-2`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 33 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-r-4 border-[#02D8E9] col-span-3`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 34 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 border-t-2 border-r-4 border-[#02D8E9]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 8 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-3 col-end-5 border-t-4 border-x-4 border-[#ff6272]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 20 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-10 col-span-1 border-t-4 border-x-4 border-[#14F195]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 19 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-11 col-span-2 border-r-2 border-l-4 border-b-4 border-[#B65805]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 15 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-13 col-span-1 border-r-4 border-b-4 border-[#B65805]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 31 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-14 border-l-4 col-span-1 border-[#02D8E9]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 31 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-span-1 border-t-2 border-r-2 border-[#02D8E9]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 32 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-16 col-span-1 border-r-4 border-[#02D8E9]`}></button>
                                    )
                                })}
                                <div className={`p-2 border-t-4 col-span-4 border-[#02D8E9]`}></div>
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 9 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-3 col-end-5 border-t-2 border-x-4 border-[#ff6272]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 20 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-10 col-span-1 border-l-4 border-r-2 border-[#14F195]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 21 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-11 col-span-1 border-t-4 border-r-4 border-[#14F195]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 35 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-12 col-span-3 border-t-4 border-l-4 border-[#02D8E9]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 36 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-15 col-span-1 border-t-4 border-x-2 border-[#02D8E9]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 32 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-16 col-span-1 border-r-4 border-[#02D8E9]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 10 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-2 col-end-4 border-t-2 border-l-4 border-r-2 border-[#ff6272]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 11 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-4 col-span-4 border-t-2 border-r-4 border-[#ff6272]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 20 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-span-2 border-t-4 border-l-4 border-[#14F195]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 20 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-span-1 border-r-2 border-[#14F195]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 22 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-11 col-span-2 border-t-2 border-r-4 border-[#14F195]`}>{key}</button>
                                    )
                                })}
                                <div className={`p-2 border-t-4 border-[#02D8E9] col-span-2`}></div>
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 36 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-15 col-span-1 border-l-4 border-r-2 border-[#02D8E9]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 37 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-16 col-span-1 border-t-2 border-b-4 border-r-4 border-[#02D8E9]`}>{key}</button>
                                    )
                                })}
                                <div className={`p-2 border-t-4 border-[#ff6272] col-start-2`}></div>
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 12 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-3 col-end-5 border-t-2 border-x-4 border-b-4 border-[#ff6272]`}>{key}</button>
                                    )
                                })}
                                <div className={`p-2 border-t-4 border-[#ff6272] col-span-3`}></div>
                                <div className={`p-2 border-t-4 border-[#14F195] col-span-2`}></div>
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 23 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-10 border-t-2 border-l-4 border-r-2 border-[#14F195]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 22 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-11 border-r-2 border-[#14F195]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 25 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-12 border-t-2 border-r-4 border-[#14F195]`}>{key}</button>
                                    )
                                })}
                                <div className={`p-2 border-t-4 border-[#02D8E9] col-start-15`}></div>
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 38 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-16 col-span-1 border-t-4 border-l-4 border-r-2 border-[#FF8C00]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 39 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-17 col-span-2 border-t-4 border-r-4 border-[#FF8C00]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 24 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-10 col-span-2 border-l-4 border-t-2 border-r-2 border-b-4 border-[#14F195]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 25 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-12 border-b-4 border-r-4 border-[#14F195]`}></button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 40 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-16 col-span-2 border-b-4 border-r-2 border-l-4 border-t-2 border-[#FF8C00]`}>{key}</button>
                                    )
                                })}
                                {mapInfos.map((territory, key) => {
                                    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
                                    return (
                                        key == 41 &&
                                        <button onClick={() => {
                                            !displayManagePanel &&
                                                setDisplayManagePanel(!displayManagePanel);
                                            setFromTerritory(key);
                                        }} className={`${index ? index.bgColor : "bg-[#556655]"} p-2 col-start-18 col-span-1 border-b-4 border-t-2 border-r-4 border-[#FF8C00]`}>{key}</button>
                                    )
                                })}
                            </div>
                            {displayManagePanel && fromTerritory != null &&
                                <div className='z-10 bg-[#312d29] border border-[#c8ab6e] absolute top-5 left-0 right-0 w-[70%] m-auto' >
                                    <div className='flex justify-end'>
                                        <button onClick={() => {
                                            setDisplayManagePanel(!displayManagePanel);
                                            setAction('deploy')
                                        }} className='text-[#ff0000]'><XIcon strokeWidth={5} />
                                        </button>
                                    </div>
                                    <div className='text-center font-bold text-xl'>Territory to manage: {fromTerritory}</div>
                                    <div className='text-left ml-4 mt-4'>Ruler: {mapInfos[fromTerritory].ruler.toBase58() != PublicKey.default.toBase58() ? mapInfos[fromTerritory].ruler.toBase58() : "None"}</div>
                                    <div className='text-left ml-4 mt-4'>Number of troops: {mapInfos[fromTerritory].troops}</div>
                                    <div className='flex justify-around my-4'>
                                        <button onClick={() => setAction('deploy')} className={`rounded-xl border ${action == "deploy" ? "border-white bg-[#c8ab6e]" : "border-[#c8ab6e]"} p-2`}>
                                            Deploy Troops
                                        </button>
                                        <button onClick={() => setAction('attack')} className={`rounded-xl border ${action == "attack" ? "border-white bg-[#c8ab6e]" : "border-[#c8ab6e]"} p-2`}>
                                            Attack From Here
                                        </button>
                                        <button onClick={() => setAction('move')} className={`rounded-xl border ${action == "move" ? "border-white bg-[#c8ab6e]" : "border-[#c8ab6e]"} p-2`}>
                                            Move Troops
                                        </button>

                                    </div>
                                    {action == "deploy" &&
                                        <Deploy playersInfos={playersInfos} fromTerritory={fromTerritory} turnCounter={turnCounter} troopsToPlay={troopsToPlay}
                                            troopsPlayed={troopsPlayed} gameId={gameId} gameMaster={gameMaster} battle={battle} SOLBalance={SOLBalance} />
                                    }
                                    {action == "attack" &&
                                        <Attack mapInfos={mapInfos} playersInfos={playersInfos} fromTerritory={fromTerritory}
                                            turnCounter={turnCounter} endPreparationPhase={endPreparationPhase} gameId={gameId}
                                            gameMaster={gameMaster} battle={battle} SOLBalance={SOLBalance} />
                                    }
                                    {action == "move" &&
                                        <Move mapInfos={mapInfos} playersInfos={playersInfos} fromTerritory={fromTerritory}
                                            turnCounter={turnCounter} endPreparationPhase={endPreparationPhase} gameId={gameId}
                                            gameMaster={gameMaster} battle={battle} SOLBalance={SOLBalance} />
                                    }
                                </div>
                            }
                            {displayBattlePanel && battleInfos &&
                                <div className='z-20 bg-[#312d29] border border-[#c8ab6e] absolute -top-full left-0 right-0 w-[70%] m-auto' >
                                    {battleInfos.attackerDiceResult.length == 0 ?
                                        <div>
                                            <div className='text-center text-[#c8ab6e] font-bold text-xl uppercase mt-2'>Battle in progress</div>
                                            <div className='flex justify-center text-lg items-center ml-4 mt-2'>
                                                <div className={`${playersInfos.find((player) => player.address == battleInfos.attacker).textColor} mr-2 font-bold`}>{shortAddress(battleInfos.attacker)}</div>
                                                <SwordsIcon />
                                                <div className={`${playersInfos.find((player) => player.address == battleInfos.defender).textColor} ml-2 font-bold`}>{shortAddress(battleInfos.defender)}</div>
                                            </div>
                                            <div className='text-left ml-4 mt-2'>Number of troops: {battleInfos.attackerTroops}</div>
                                            <div className='text-left ml-4 mt-2'>Attacking Territory: {battleInfos.attackingTerritory}</div>
                                            <div className='text-left ml-4 mt-2'>Attacked Territory: {battleInfos.attackedTerritory}</div>
                                            {(publicKey && battleInfos.defender == publicKey.toBase58()) ?
                                                <div className='flex flex-col mt-6 mb-4'>
                                                    <label className='ml-4 font-bold text-lg' >{shortAddress(battleInfos.defender)} select your troops!</label>
                                                    <input
                                                        className='mx-4 text-[#c8ab6e] pl-2 border rounded-xl border-white bg-[#312d29]'
                                                        type='number'
                                                        placeholder="Number of troops to be deployed..."
                                                        value={defendingTroops}
                                                        onChange={(e) => setDefendingTroops(parseInt(e.target.value))}
                                                        min={1}
                                                        max={mapInfos[battleInfos.attackedTerritory].troops >= 2 ? 2 : mapInfos[battleInfos.attackedTerritory].troops}
                                                    >
                                                    </input>

                                                    <label className='ml-4 text-[#c8ab6e]' >Max: {mapInfos[battleInfos.attackedTerritory].troops >= 2 ? 2 : mapInfos[battleInfos.attackedTerritory].troops}</label>
                                                    <button onClick={() => resolveBattle(defendingTroops)} className='rounded-xl text-[#c8ab6e] border border-white m-auto p-2'>Resolve Battle</button>
                                                </div>
                                                :
                                                <div className='my-2 flex justify-center'>
                                                    <Loader text='Awaiting response from the defender...' />
                                                </div>
                                            }
                                        </div> :
                                        <div>
                                            <div className='flex justify-end'>
                                                <button onClick={() => {
                                                    setDisplayBattlePanel(!displayBattlePanel);
                                                }} className='text-[#ff0000]'><XIcon strokeWidth={5} />
                                                </button>
                                            </div>

                                            <div className='text-center text-[#c8ab6e] font-bold text-xl uppercase'>Battle results</div>
                                            <div className='flex justify-center text-lg items-center ml-4 mt-2'>
                                                <div className={`${playersInfos.find((player) => player.address == battleInfos.attacker).textColor} mr-2 font-bold`}>{shortAddress(battleInfos.attacker)}</div>
                                                <SwordsIcon />
                                                <div className={`${playersInfos.find((player) => player.address == battleInfos.defender).textColor} ml-2 font-bold`}>{shortAddress(battleInfos.defender)}</div>
                                            </div>
                                            <div className='text-left ml-4 mt-2'>Attacker Dice Results ({troopsLost(battleInfos.attackerDiceResult, battleInfos.defenderDiceResult).attackerLostTroops} troop(s) lost)
                                                <DiceResults dices={battleInfos.attackerDiceResult} />
                                            </div>
                                            <div className='text-left ml-4 my-2'>Defender Dice Results ({troopsLost(battleInfos.attackerDiceResult, battleInfos.defenderDiceResult).defenderLostTroops} troop(s) lost)
                                                <DiceResults dices={battleInfos.defenderDiceResult} />
                                            </div>
                                            {mapInfos[battleInfos.attackedTerritory].ruler.toBase58() == battleInfos.attacker &&
                                                <div className='text-left ml-4 mb-2'>
                                                    <span className={`${playersInfos.find((player) => player.address == battleInfos.attacker).textColor} mr-2 font-bold`}>{shortAddress(battleInfos.attacker)}</span>has conquered a new territory!
                                                </div>
                                            }
                                        </div>
                                    }</div>
                            }
                            {displayClaimBonusPanel &&
                                <div className='z-20 bg-[#312d29] border border-[#c8ab6e] absolute top-5 left-0 right-0 w-[70%] m-auto' >
                                    <div className='flex justify-end'>
                                        <button onClick={() => {
                                            setDisplayClaimBonusPanel(!displayClaimBonusPanel);
                                        }} className='text-[#ff0000]'><XIcon strokeWidth={5} />
                                        </button>
                                    </div>
                                    <div className='text-center text-[#c8ab6e] font-bold text-xl uppercase'>Claim Bonus Troops</div>
                                    <div className='text-left ml-4 mt-4'>Cards to trade</div>
                                    <div className='flex flex-col mt-4 mb-4'>
                                        <select
                                            className='mx-4 pl-2 mb-2 border-2 rounded-xl border-[#c8ab6e] bg-[#312d29]'
                                            onChange={(e) => setCard1(parseInt(e.target.value))}
                                        >
                                            <option
                                                value={9}
                                                label={"Select card 1..."}
                                            />
                                            <option
                                                value={0}
                                                label={"Infantry"}
                                            />
                                            <option
                                                value={1}
                                                label={"Cavalry"}
                                            />
                                            <option
                                                value={2}
                                                label={"Artillery"}
                                            />
                                        </select>
                                        <select
                                            className='mx-4 pl-2 mb-2 border-2 rounded-xl border-[#c8ab6e] bg-[#312d29]'
                                            onChange={(e) => setCard2(parseInt(e.target.value))}
                                        >
                                            <option
                                                value={9}
                                                label={"Select card 2"}
                                            />
                                            <option
                                                value={0}
                                                label={"Infantry"}
                                            />
                                            <option
                                                value={1}
                                                label={"Cavalry"}
                                            />
                                            <option
                                                value={2}
                                                label={"Artillery"}
                                            />
                                        </select>
                                        <select
                                            className='mx-4 pl-2 mb-4 border-2 rounded-xl border-[#c8ab6e] bg-[#312d29]'
                                            onChange={(e) => setCard3(parseInt(e.target.value))}
                                        >
                                            <option
                                                value={9}
                                                label={"Select card 3"}
                                            />
                                            <option
                                                value={0}
                                                label={"Infantry"}
                                            />
                                            <option
                                                value={1}
                                                label={"Cavalry"}
                                            />
                                            <option
                                                value={2}
                                                label={"Artillery"}
                                            />
                                        </select>
                                        <button onClick={() => claimBonus(card1, card2, card3)} className='rounded-xl text-[#c8ab6e] border border-white m-auto p-2'>Claim Bonus</button>
                                    </div>

                                </div>
                            }
                            {displayWinnerPanel &&
                                <div className='z-20 bg-[#312d29] border border-[#c8ab6e] absolute top-5 left-0 right-0 w-[70%] m-auto' >
                                    <div className='flex justify-end'>
                                        <button onClick={() => {
                                            setDisplayWinnerPanel(!displayWinnerPanel);
                                        }} className='text-[#ff0000]'><XIcon strokeWidth={5} />
                                        </button>
                                    </div>
                                    <div className='text-[#c8ab6e] flex justify-center font-bold text-xl uppercase'><TrophyIcon /> <span className='ml-2' >Winner</span></div>
                                    <div className='flex justify-center ml-4 my-4'>
                                        <div className='mr-2' >{shortAddress(winner)} won this game!</div>
                                        <div className='mr-1'>Congratulations!</div>
                                        <PartyPopperIcon />
                                    </div>
                                </div>
                            }
                        </div>
                        <ContinentBonusInfos />
                    </div>
                }
            </div>
        </div>
    );
};