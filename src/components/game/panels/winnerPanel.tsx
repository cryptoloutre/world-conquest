import { PartyPopperIcon, TrophyIcon, XIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { shortAddress } from "utils/shortAddress";

interface Props {
    winner: string | null,
    displayWinnerPanel: boolean,
    setDisplayWinnerPanel: Dispatch<SetStateAction<boolean>>
}

export const WinnerPanel: React.FC<Props> = ({ winner, displayWinnerPanel, setDisplayWinnerPanel }) => {

    return (
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
    );
};