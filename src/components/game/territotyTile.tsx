import { BN, Program } from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { ComputeBudgetProgram, PublicKey, SystemProgram, SYSVAR_SLOT_HASHES_PUBKEY, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card';
import { connection, PROGRAM_ID } from 'config';
import { IDL } from 'idl/idl';
import { MoveLeftIcon } from 'lucide-react';
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { notify } from 'utils/notifications';

interface Props {
    territory: any;
    playersInfos: {
        address: string;
        territoriesNumber: number;
        color: string;
    }[];
    className: string
}

export const TerritoryTile: React.FC<Props> = ({ territory, playersInfos, className }) => {
    const index = playersInfos.find((n) => n.address == territory.ruler.toBase58());
    const [toDisplay, setToDisplay] = useState(false);

    return (
        <button onClick={() => !toDisplay && setToDisplay(!toDisplay)} className={`${index ? index.color : "bg-[#556655]"} ${className} relative`}>
            <div>{territory.troops} troops</div>
            {toDisplay &&
                <div>
                    <button className='rounded-full bg-[#312d29] border border-[#c8ab6e] p-4 absolute -top-[5%] z-10' onClick={() => setToDisplay(!toDisplay)}>Deploy Troops</button>
                    <button className='rounded-full bg-[#312d29] border border-[#c8ab6e] p-4 absolute -right-[5%] z-10'>Battle</button>
                    <button className='rounded-full bg-[#312d29] border border-[#c8ab6e] p-4 absolute -left-[5%] z-10'>Move Troops</button>
                </div>
            }
        </button>
    );
};