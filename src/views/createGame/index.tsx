
import { FC, useEffect, useState } from "react";
import { Program, BN } from "@coral-xyz/anchor"
import { IDL } from "idl/idl"
import { connection, PROGRAM_ID } from "config";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { notify } from "utils/notifications";
import { addCULimit, shufflePlayers } from "utils/gameUtils";
import Link from "next/link";
import { CheckIcon } from "lucide-react";

export const CreateGameView: FC = ({ }) => {
  const { publicKey, sendTransaction } = useWallet();
  const program = new Program(IDL, PROGRAM_ID, { connection });
  const [players, setPlayers] = useState<string>();
  const [created, setCreated] = useState<boolean>(false);
  const [SOLBalance, setSOLBalance] = useState<number>();

  const [gameIdCounter] = PublicKey.findProgramAddressSync(
    [Buffer.from("GAME_COUNTER")],
    PROGRAM_ID
  );

  async function getUserSolBalance() {
    const SOLBalance = await connection.getBalance(
      publicKey,
      'confirmed'
    );

    setSOLBalance(SOLBalance)
  }

  useEffect(() => {
    if (publicKey) {
      getUserSolBalance();
    }
  }, [publicKey]);

  const create = async () => {

    if (!publicKey) {
      notify({ type: 'error', message: `Wallet not connected!` });
      console.log('error', `Send Transaction: Wallet not connected!`);
      return;
    }

    try {
      setCreated(false);
      // @ts-ignore
      const gameId = (await program.account.gameIdCounter.fetch(gameIdCounter)).id;
      const [gameMaster] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("GAME_MASTER"),
          new BN(gameId).toArrayLike(Buffer, "be", 8)]
        ,
        PROGRAM_ID
      );
      const [battle] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("BATTLE"),
          gameMaster.toBuffer()
        ],
        PROGRAM_ID
      );

      const _playersArray = players.split("\n");
      if (_playersArray.length < 2 || _playersArray.length > 5) {
        notify({ type: 'error', message: `Invalid number of players` });
        console.log('error', `Send Transaction: Invalid number of players!`);
        return;
      }
      _playersArray.push(publicKey.toBase58());

      const shuffledPlayers = shufflePlayers(_playersArray);
      const playersArray = shuffledPlayers.map((player) => new PublicKey(player));

      if (SOLBalance <= 0.1 * LAMPORTS_PER_SOL) {
        await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)
      }

      const createGameIx = await program.methods
        .createGame(playersArray)
        .accounts({
          gameIdCounter: gameIdCounter,
          gameMaster: gameMaster,
          battle: battle,
          signer: publicKey,
          systemProgram: SystemProgram.programId
        })
        .instruction();

      const transaction = await addCULimit([createGameIx], publicKey);

      // Send transaction and await for signature
      const signature = await sendTransaction(transaction, connection);
      setCreated(true);

      console.log(signature);

    }
    catch (error) {
      const err = (error as any)?.message;
      console.log(err);
      notify({ type: 'error', message: err });
    }
  }

  return (
    <div className="md:hero mt-[25%] mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h1 className="text-center text-5xl font-bold mt-10 mb-8">
          Create Game
        </h1>

        <textarea
          className="text-[#c8ab6e] pt-2 pl-2 rounded-xl border border-[#c8ab6e]"
          placeholder="Enter players' addresses here... (one address per line)"
          value={players}
          onChange={(e) => setPlayers(e.target.value)}
          rows={6}
          cols={60}
          spellCheck="false" />
        <label className=""><span className="font-bold underline">Note:</span> Don&apos;t add your address. Min: 2, Max: 5</label>
        <button onClick={create} className="font-bold py-2 px-4 bg-[#312d29] border border-[#c8ab6e] rounded-xl">Create</button>

        {created &&
          <div className="mt-2 flex items-center text-xl">
            <CheckIcon className="text-[#228B22]" strokeWidth={5} />
            <div> Game created! Click <Link href={"/join-game"} className="font-bold underline">here</Link> to join it</div>
            {/* <Link href={"/join-game"} className="font-bold py-2 px-4 bg-[#312d29] border border-[#c8ab6e] rounded-xl">Join Game</Link> */}
          </div>
        }
      </div>
    </div>
  );
};
