import type { NextPage } from "next";
import Head from "next/head";
import { JoinGameView } from "../views";

const JoinGame: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>World Conquest</title>
        <meta
          name="description"
          content="Join a World Conquest's game"
        />
      </Head>
      <JoinGameView />
    </div>
  );
};

export default JoinGame;
