import { FC } from 'react';
import Link from 'next/link';
import { GithubIcon, TwitterIcon } from 'lucide-react';
export const Footer: FC = () => {
    return (
        <div className="flex">
            <footer className="border-t-2 border-[#141414] bg-black w-screen" >
                <div className="py-4 flex justify-center">
                    <div className="grid grid-cols-2">
                        <Link href={"https://github.com/cryptoloutre/world-conquest"} target='_blank' className='flex mx-4'>
                            <GithubIcon />
                        </Link>
                        <Link href={"https://x.com/WorldConquestSO"} target='_blank' className='flex mx-4'>
                            <TwitterIcon />
                        </Link>
                        
                    </div>
                </div>
            </footer>
        </div>
    );
};
