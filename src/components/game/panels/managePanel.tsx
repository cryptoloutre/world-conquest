import { PublicKey} from "@solana/web3.js";
import { XIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Deploy } from "../actions/deploy";
import { Attack } from "../actions/attack";
import { Move } from "../actions/move";

interface Props {
    displayManagePanel: boolean,
    setDisplayManagePanel: Dispatch<SetStateAction<boolean>>,
    playersInfos: { address: string, territoriesNumber: number, textColor: string, bgColor: string, bonusCards: number[] }[],
    mapInfos: any,
    gameId: number,
    gameMaster: PublicKey,
    battle: PublicKey,
    turnCounter: number,
    SOLBalance: number,
    fromTerritory: number,
    troopsPlayed: number,
    troopsToPlay: number,
    endPreparationPhase: number,
}

export const ManagePanel: React.FC<Props> = ({ displayManagePanel, setDisplayManagePanel, playersInfos, mapInfos, gameId, gameMaster, battle, turnCounter, SOLBalance, fromTerritory, troopsPlayed, troopsToPlay, endPreparationPhase }) => {
    const [action, setAction] = useState<string>('deploy');

    return (
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
    );
};