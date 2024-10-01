import { BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { connection, program } from "config";
import { useState } from "react";
import { addCULimit } from "utils/gameUtils";
import { notify } from "utils/notifications";

interface Props {
    playersInfos: { address: string, territoriesNumber: number, textColor: string, bgColor: string, bonusCards: number[] }[],
    fromTerritory: number,
    turnCounter: number,
    troopsToPlay: number,
    troopsPlayed: number,
    gameId: number,
    gameMaster: PublicKey
    battle: PublicKey,
    SOLBalance: number,
}

export const Deploy: React.FC<Props> = ({ playersInfos, gameId, gameMaster, battle, fromTerritory, turnCounter, troopsToPlay, troopsPlayed, SOLBalance }) => {

    const { publicKey, sendTransaction } = useWallet();
    const [troopsToBeDeployed, setTroopsToBeDeployed] = useState(null);

    const deployTroops = async (territory: number, amount: number) => {

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

        if (troopsPlayed == troopsToPlay) {
            notify({ type: 'error', message: `You already deployed all your troops!` });
            console.log('error', `Send Transaction: You already deployed all your troops!`);
            return;
        }

        const bonusCards = (playersInfos.find((player) => player.address == currentPlayer)).bonusCards.length;

        if (bonusCards >= 5) {
            notify({ type: 'error', message: `You have to claim your bonus reinforcements!` });
            console.log('error', `Send Transaction: You have to claim your bonus reinforcements!`);
            return;
        }

        try {
            if (SOLBalance <= 0.1 * LAMPORTS_PER_SOL) {
                await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)
            }
            const createDeployTroopsIx = await program.methods
                .deployTroops(new BN(gameId), amount, territory)
                .accounts({
                    gameMaster: gameMaster,
                    battle: battle,
                    signer: publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .instruction();

            const transaction = await addCULimit([createDeployTroopsIx], publicKey);

            // Send transaction and await for signature
            const signature = await sendTransaction(transaction, connection);
            notify({ type: 'success', message: `Troops deployed` });
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
            <input
                className='mx-4 pl-2 border-2 rounded-xl border-[#c8ab6e] bg-[#312d29]'
                type='number'
                placeholder="Number of troops to be deployed..."
                value={troopsToBeDeployed}
                onChange={(e) => setTroopsToBeDeployed(parseInt(e.target.value))}
                min={1}
                max={troopsToPlay - troopsPlayed}
            >
            </input>

            <label className='ml-4' >Max: {troopsToPlay - troopsPlayed}</label>
            <button onClick={() => deployTroops(fromTerritory, troopsToBeDeployed)} className='rounded-xl border border-[#c8ab6e] m-auto p-2'>Deploy</button>
        </div>

    );
};