import type { NextPage } from "next";
import Head from "next/head";
import { CreateGameView } from "../views";

const CreateGame: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>World Conquest</title>
        <meta
          name="description"
          content="Create a World Conquest's game"
        />
      </Head>
      <CreateGameView />
    </div>
  );
};

export default CreateGame;
