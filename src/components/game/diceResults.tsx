import { Dice1Icon, Dice2Icon, Dice3Icon, Dice4Icon, Dice5Icon, Dice6Icon } from "lucide-react";

interface Props {
    dices: number[]
}

export const DiceResults: React.FC<Props> = ({ dices }) => {

    return (
        <div className='flex'>
            {dices.map((dice) => {
                if (dice == 1)
                    return <Dice1Icon size={32} className="mr-2"/>
                else if (dice == 2)
                    return <Dice2Icon size={32} className="mr-2"/>
                else if (dice == 3)
                    return <Dice3Icon size={32} className="mr-2"/>
                else if (dice == 4)
                    return <Dice4Icon size={32} className="mr-2"/>
                else if (dice == 5)
                    return <Dice5Icon size={32} className="mr-2"/>
                else return <Dice6Icon size={32} className="mr-2"/>
            })}
        </div>
    );
};