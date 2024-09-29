import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>World Conquest</title>
        <meta
          name="description"
          content="World Conquest is a turn-based strategy onchain game. Your mission? To conquer the world!"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
