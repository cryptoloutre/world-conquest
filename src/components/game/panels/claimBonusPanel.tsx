import { BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { connection, program } from "config";
import { XIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { addCULimit, isValidCardsCombinaison } from "utils/gameUtils";
import { notify } from "utils/notifications";

interface Props {
    displayClaimBonusPanel: boolean,
    setDisplayClaimBonusPanel: Dispatch<SetStateAction<boolean>>,
    playersInfos: { address: string, territoriesNumber: number, textColor: string, bgColor: string, bonusCards: number[] }[],
    gameId: number,
    gameMaster: PublicKey,
    battle: PublicKey,
    turnCounter: number,
    SOLBalance: number,
}

export const ClaimBonusPanel: React.FC<Props> = ({ displayClaimBonusPanel, setDisplayClaimBonusPanel, playersInfos, gameId, gameMaster, battle, turnCounter, SOLBalance}) => {
    const { publicKey, sendTransaction } = useWallet();

    const [card1, setCard1] = useState(9);
    const [card2, setCard2] = useState(9);
    const [card3, setCard3] = useState(9);

    const claimBonus = async (card1: number, card2: number, card3: number) => {

        console.log("combinaison", card1, card2, card3)
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

    return (
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
    );
};