export const ContinentBonusInfos: React.FC = () => {

    return (
        <div className='mt-12' >
            <div className='text-xl font-bold'>
                Own continents for a troop bonus
            </div>
            <div className='grid gap-2 grid-cols-3 mt-4'>
                <div className='flex items-center text-center'>
                    <span className={`bg-white h-[1em] w-[1em] mx-2`}></span> North America (5 troops)
                </div>
                <div className='flex items-center text-center'>
                    <span className={`bg-[#B65805] h-[1em] w-[1em] mx-2`}></span> Europe (5 troops)
                </div>
                <div className='flex items-center text-center'>
                    <span className={`bg-[#02D8E9] h-[1em] w-[1em] mx-2`}></span> Asia (7 troops)
                </div>
                <div className='flex items-center text-center'>
                    <span className={`bg-[#FFC4CA] h-[1em] w-[1em] mx-2`}></span> South America (2 troops)
                </div>
                <div className='flex items-center text-center'>
                    <span className={`bg-[#14F195] h-[1em] w-[1em] mx-2`}></span> Africa (3 troops)
                </div>
                <div className='flex items-center text-center'>
                    <span className={`bg-[#FF8C00] h-[1em] w-[1em] mx-2`}></span> Australia (2 troops)
                </div>
            </div>
        </div>
    );
};