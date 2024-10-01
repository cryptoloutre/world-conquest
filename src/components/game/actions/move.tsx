import { BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { connection, program } from "config";
import { useState } from "react";
import { addCULimit } from "utils/gameUtils";
import { notify } from "utils/notifications";

interface Props {
    mapInfos: any,
    playersInfos: { address: string, territoriesNumber: number, textColor: string, bgColor: string, bonusCards: number[] }[],
    fromTerritory: number,
    turnCounter: number,
    endPreparationPhase: number,
    gameId: number,
    gameMaster: PublicKey
    battle: PublicKey,
    SOLBalance: number,
}

export const Move: React.FC<Props> = ({ mapInfos, playersInfos, gameId, gameMaster, battle, fromTerritory, turnCounter, endPreparationPhase, SOLBalance }) => {

    const { publicKey, sendTransaction } = useWallet();
    const [toTerritory, setToTerritory] = useState<number>(null);
    const [movingTroops, setMovingTroops] = useState(null);

    const movePossibilities: { territory: number, ruler: string, troops: number }[] = [];

    Array.from(mapInfos[fromTerritory].borders).map((t: any) => {
        const ruler = mapInfos[t].ruler;
        const troops = mapInfos[t].troops;
        if (ruler == publicKey.toBase58()) {
            movePossibilities.push({ territory: t, ruler: ruler, troops: troops })
        }
    })

    const moveTroops = async (from: number, to: number, moving: number) => {

        if (!publicKey) {
            notify({ type: 'error', message: `Wallet not connected!` });
            console.log('error', `Send Transaction: Wallet not connected!`);
            return;
        }

        const indexToPlay = turnCounter % playersInfos.length;
        const currentPlayer = playersInfos[indexToPlay].address;

        if (publicKey.toBase58() != currentPlayer) {
            notify({ type: 'error', message: `Not tour turn to play!` });
            console.log('error', `Send Transaction: Not tour turn to play!`);
            return;
        }

        if (turnCounter < endPreparationPhase) {
            notify({ type: 'error', message: `Can't move troops before the end of preparation phase! (End turn ${endPreparationPhase})` });
            console.log('error', `Send Transaction: Can't move troops before the end of preparation phase!`);
            return;
        }

        try {
            if (SOLBalance <= 0.1 * LAMPORTS_PER_SOL) {
                await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)
            }
            const mooveTroopsIx = await program.methods
                .mooveTroops(new BN(gameId), from, to, moving)
                .accounts({
                    gameMaster: gameMaster,
                    signer: publicKey,
                    battle: battle,
                    systemProgram: SystemProgram.programId,
                })
                .instruction();

            const transaction = await addCULimit([mooveTroopsIx], publicKey);

            // Send transaction and await for signature
            const signature = await sendTransaction(transaction, connection);
            notify({ type: 'success', message: `Troops moved` });
            console.log(signature);

        }
        catch (error) {
            const err = (error as any)?.message;
            console.log(err);
            notify({ type: 'error', message: err });
        }
    }

    return (
        <div className='flex flex-col mt-6 mb-4'>
            {movePossibilities.length != 0 ?
                <select
                    className='mx-4 pl-2 mb-2 border-2 rounded-xl border-[#c8ab6e] bg-[#312d29]'
                    onChange={(e) => setToTerritory(parseInt(e.target.value))}
                >
                    <option
                        value={""}
                        label={`Select a territory to move troops to...`}
                    />
                    {movePossibilities.map((possibility, key) => {
                        return (
                            <option
                                key={key}
                                className={`${playersInfos.find((player) => player.address == possibility.ruler).textColor}`}
                                value={possibility.territory}
                                label={`${possibility.territory} (${possibility.troops} troops)`}
                            />
                        )
                    })}

                </select>
                : <div className='mx-4 mb-2'>No valid border territories to move troops to</div>
            }
            <input
                className='mx-4 mb-2 pl-2 border-2 rounded-xl border-[#c8ab6e] bg-[#312d29]'
                type='number'
                placeholder="Number of troops to move..."
                value={movingTroops}
                onChange={(e) => setMovingTroops(parseInt(e.target.value))}
                min={1}
                max={mapInfos[fromTerritory].troops - 1 >= 0 && mapInfos[fromTerritory].troops - 1}
            >
            </input>
            {turnCounter >= endPreparationPhase && <label className='ml-4' >Max: {mapInfos[fromTerritory].troops - 1}</label>}
            <button onClick={() => moveTroops(fromTerritory, toTerritory, movingTroops)} className='rounded-xl border border-[#c8ab6e] mt-2 m-auto p-2'>Move Troops</button>
        </div>

    );
};