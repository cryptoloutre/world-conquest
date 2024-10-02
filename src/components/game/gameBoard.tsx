import { PublicKey } from "@solana/web3.js";
import { Dispatch, SetStateAction, useState } from "react";
import { ClaimBonusPanel } from "./panels/claimBonusPanel";
import { ManagePanel } from "./panels/managePanel";
import { WinnerPanel } from "./panels/winnerPanel";
import { BattlePanel } from './panels/battlePanel';

interface Props {
    winner: string | null,
    displayWinnerPanel: boolean,
    setDisplayWinnerPanel: Dispatch<SetStateAction<boolean>>,
    displayBattlePanel: boolean,
    setDisplayBattlePanel: Dispatch<SetStateAction<boolean>>,
    displayClaimBonusPanel: boolean,
    setDisplayClaimBonusPanel: Dispatch<SetStateAction<boolean>>,
    displayManagePanel: boolean,
    setDisplayManagePanel: Dispatch<SetStateAction<boolean>>,
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
    troopsPlayed: number,
    troopsToPlay: number,
    endPreparationPhase: number,
}

export const GameBoard: React.FC<Props> = ({
    playersInfos,
    battleInfos,
    mapInfos,
    gameId,
    gameMaster,
    battle,
    turnCounter,
    SOLBalance,
    winner,
    troopsPlayed,
    troopsToPlay,
    endPreparationPhase,
    displayWinnerPanel,
    setDisplayWinnerPanel,
    displayBattlePanel,
    setDisplayBattlePanel,
    displayClaimBonusPanel,
    setDisplayClaimBonusPanel,
    displayManagePanel,
    setDisplayManagePanel
}) => {
    const [fromTerritory, setFromTerritory] = useState<number>(null);

    return (
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
                <ManagePanel displayManagePanel={displayManagePanel} setDisplayManagePanel={setDisplayManagePanel} playersInfos={playersInfos}
                    mapInfos={mapInfos} gameId={gameId} gameMaster={gameMaster} battle={battle} turnCounter={turnCounter}
                    SOLBalance={SOLBalance} fromTerritory={fromTerritory} troopsPlayed={troopsPlayed} troopsToPlay={troopsToPlay} endPreparationPhase={endPreparationPhase} />
            }
            {displayBattlePanel && battleInfos &&
                <BattlePanel playersInfos={playersInfos} battleInfos={battleInfos} mapInfos={mapInfos}
                    turnCounter={turnCounter} gameId={gameId} gameMaster={gameMaster} battle={battle}
                    SOLBalance={SOLBalance} displayBattlePanel={displayBattlePanel} setDisplayBattlePanel={setDisplayBattlePanel} />
            }
            {displayClaimBonusPanel &&
                <ClaimBonusPanel playersInfos={playersInfos} turnCounter={turnCounter}
                    gameId={gameId} gameMaster={gameMaster} battle={battle} SOLBalance={SOLBalance}
                    displayClaimBonusPanel={displayClaimBonusPanel} setDisplayClaimBonusPanel={setDisplayClaimBonusPanel} />
            }
            {displayWinnerPanel &&
                <WinnerPanel winner={winner} displayWinnerPanel={displayWinnerPanel} setDisplayWinnerPanel={setDisplayWinnerPanel} />
            }
        </div>
    );
};