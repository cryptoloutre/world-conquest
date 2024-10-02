
import { FC, useEffect, useState } from "react";
import { Program } from "@coral-xyz/anchor"
import { IDL } from "idl/idl"
import { connection, PROGRAM_ID } from "config";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { SwordsIcon } from 'lucide-react';
import { Game } from "components/game/game";
import { shortAddress } from "utils/shortAddress";

export const JoinGameView: FC = ({ }) => {
  const { publicKey } = useWallet();
  const program = new Program(IDL, PROGRAM_ID, { connection });
  const [myOngoingGames, setMyOngoingGames] = useState<{ id: number, players: string[], game: string, winner: string }[]>([]);
  const [myFinishedGames, setMyFinishedGames] = useState<{ id: number, players: string[], game: string, winner: string }[]>([]);
  const [gamesFetched, setGamesFetched] = useState<boolean>(false);
  const [gameAddress, setGameAddress] = useState<String>('');

  const [gameIdCounter] = PublicKey.findProgramAddressSync(
    [Buffer.from("GAME_COUNTER")],
    PROGRAM_ID
  );

  async function getUserGames() {
    setGamesFetched(false);
    setGameAddress("");
    // @ts-ignore
    const allGames = await program.account.gameMaster.all();

    const userOngoingGames = [];
    const userFinishedGames = [];

    allGames.map((game: any) => {
      const _players = game.account.players;
      _players.map((player: any) => {
        if (player.toBase58() == publicKey.toBase58()) {
          const players = [];
          for (let i = 0; i < _players.length; i++) {
            players.push(_players[i].toBase58())
          }
          const winner = game.account.winner.toBase58();
          if (winner == PublicKey.default.toBase58()) {
            userOngoingGames.push({
              id: Number(game.account.id),
              game: game.publicKey.toBase58(),
              players: players,
              winner: game.account.winner.toBase58()
            })
          }
          else {
            userFinishedGames.push({
              id: Number(game.account.id),
              game: game.publicKey.toBase58(),
              players: players,
              winner: game.account.winner.toBase58()
            })
          }

        }
      })
    })
    userOngoingGames.sort(function (a, b) {
      if (a.id < b.id) {
        return -1
      }
    })
    userFinishedGames.sort(function (a, b) {
      if (a.id < b.id) {
        return -1
      }
    })
    setMyOngoingGames(userOngoingGames);
    setMyFinishedGames(userFinishedGames);
    setGamesFetched(true);
    console.log(userOngoingGames);
    console.log(userFinishedGames);
  }

  useEffect(() => {
    if (publicKey) {
      getUserGames();
    }
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey) { return; }
    connection.onAccountChange(gameIdCounter, getUserGames, "confirmed");
  });

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className="text-left">

          {!gamesFetched && publicKey && <div>Fetching...</div>}
          {gamesFetched && gameAddress == "" &&
            <div>
              <div>
                <div className="text-left text-2xl font-bold mb-2 underline">Ongoing Game</div>
                <div className="grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-5">
                  {myOngoingGames.length != 0 ? myOngoingGames.map((game) =>
                    game.winner == PublicKey.default.toBase58() &&
                    (
                      <Card key={game.id} className="border-secondary group-hover:border-white">
                        <CardHeader>
                          <CardTitle className="space-y-3">
                            <span className="block font-bold group-hover:text-pretty">
                              Game #{game.id}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          {game.players.map((player, key) => (
                            <div key={key} className="">
                              {shortAddress(player)}
                              {key < game.players.length - 1 && <div className="flex justify-center"><SwordsIcon /></div>}
                            </div>
                          )

                          )}
                          <button onClick={() => setGameAddress(game.game)} className="mt-2 bg-[#312d29] border border-[#c8ab6e] py-1 px-3 rounded-lg uppercase font-bold">join</button>
                        </CardContent>
                      </Card>
                    )) : <div>No game found...</div>}

                </div>
              </div>
              <div className="mt-4">
                <div className="text-left text-2xl font-bold mb-2 underline">Game Finished</div>
                <div className="grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-5">
                  {myFinishedGames.length != 0 ? myFinishedGames.map((game) =>
                    game.winner != PublicKey.default.toBase58() &&
                    (
                      <Card key={game.id} className="border-secondary group-hover:border-white">
                        <CardHeader>
                          <CardTitle className="space-y-3">
                            <span className="block font-bold group-hover:text-pretty">
                              Game #{game.id}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                          {game.players.map((player, key) => (
                            <div key={key} className="">
                              {shortAddress(player)}
                              {key < game.players.length - 1 && <div className="flex justify-center"><SwordsIcon /></div>}
                            </div>
                          )

                          )}
                          <button onClick={() => setGameAddress(game.game)} className="mt-2 bg-[#312d29] border border-[#c8ab6e] py-1 px-3 rounded-lg uppercase font-bold">join</button>
                        </CardContent>
                      </Card>
                    ))
                    : <div>No game found...</div>}
                </div>
              </div>
            </div>

          }
          {gameAddress != "" && <Game gameAddress={gameAddress} setGameAddress={setGameAddress} />}
        </div>
      </div>
    </div>
  );
};
