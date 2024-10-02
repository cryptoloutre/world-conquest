import { BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_SLOT_HASHES_PUBKEY } from "@solana/web3.js";
import { connection, program } from "config";
import { SwordsIcon, XIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { addCULimit, troopsLost } from "utils/gameUtils";
import { notify } from "utils/notifications";
import { shortAddress } from "utils/shortAddress";
import { DiceResults } from "../diceResults";
import { Loader } from "components/Loader";

interface Props {
    displayBattlePanel: boolean,
    setDisplayBattlePanel: Dispatch<SetStateAction<boolean>>,
    playersInfos: { address: string, territoriesNumber: number, textColor: string, bgColor: string, bonusCards: number[] }[],
    battleInfos: {
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
    },
    mapInfos: any,
    gameId: number,
    gameMaster: PublicKey,
    battle: PublicKey,
    turnCounter: number,
    SOLBalance: number,
}

export const BattlePanel: React.FC<Props> = ({ displayBattlePanel, setDisplayBattlePanel, playersInfos, battleInfos, mapInfos, gameId, gameMaster, battle, turnCounter, SOLBalance }) => {
    const { publicKey, sendTransaction } = useWallet();
    const [defendingTroops, setDefendingTroops] = useState(null);

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

    return (
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
            }
        </div>
    );
};