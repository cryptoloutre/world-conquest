import { BN, Program } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_SLOT_HASHES_PUBKEY } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { connection, PROGRAM_ID } from 'config';
import { IDL } from 'idl/idl';
import { MoveLeftIcon } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { notify } from 'utils/notifications';
import { addCULimit, getEndPreparationPhase, getHand } from 'utils/gameUtils';
import { shortAddress } from 'utils/shortAddress';
import { ContinentBonusInfos } from './continentBonusInfo';
import { GameBoard } from './gameBoard';

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

    const { publicKey, sendTransaction } = useWallet();
    const program = new Program(IDL, PROGRAM_ID, { connection });
    const [SOLBalance, setSOLBalance] = useState<number>();
    const [playersInfos, setPlayersInfos] = useState<{ address: string, territoriesNumber: number, textColor: string, bgColor: string, bonusCards: number[] }[]>(null);
    const [currentPlayer, setCurrentPlayer] = useState<string>(null);
    const [winner, setWinner] = useState<string>(null);
    const [mapInfos, setMapInfos] = useState(null);
    const [endPreparationPhase, setEndPreparationPhase] = useState(null);
    const [turnCounter, setTurnCounter] = useState(1);
    const [bonusReinforcements, setBonusReinforcements] = useState(1);
    const [troopsToPlay, setTroopsToPlay] = useState(0);
    const [troopsPlayed, setTroopsPlayed] = useState(0);
    const [gameId, setGameId] = useState(null);
    const [error, setError] = useState<string>(null);
    const [displayManagePanel, setDisplayManagePanel] = useState(false);
    const [displayBattlePanel, setDisplayBattlePanel] = useState(false);
    const [displayClaimBonusPanel, setDisplayClaimBonusPanel] = useState(false);
    const [displayWinnerPanel, setDisplayWinnerPanel] = useState(false);
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
                        <GameBoard winner={winner} displayWinnerPanel={displayWinnerPanel} setDisplayWinnerPanel={setDisplayWinnerPanel}
                            displayBattlePanel={displayBattlePanel} setDisplayBattlePanel={setDisplayBattlePanel} displayClaimBonusPanel={displayClaimBonusPanel}
                            setDisplayClaimBonusPanel={setDisplayClaimBonusPanel} displayManagePanel={displayManagePanel} setDisplayManagePanel={setDisplayManagePanel}
                            playersInfos={playersInfos} battleInfos={battleInfos} mapInfos={mapInfos} gameId={gameId} gameMaster={gameMaster} battle={battle}
                            turnCounter={turnCounter} SOLBalance={SOLBalance} troopsPlayed={troopsPlayed} troopsToPlay={troopsToPlay} endPreparationPhase={endPreparationPhase} />
                        <ContinentBonusInfos />
                    </div>
                }
            </div>
        </div>
    );
};