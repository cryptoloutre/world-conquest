import type { NextPage } from "next";
import Head from "next/head";
import { RulesView } from "../views";

const Rules: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>World Conquest</title>
        <meta
          name="description"
          content="Read the World Conquest's rules"
        />
      </Head>
      <RulesView />
    </div>
  );
};

export default Rules;
