import { Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL } from "idl/idl";

export const PROGRAM_ID: PublicKey = new PublicKey("5envej2Ue7gH2EnBHJsqCEyHrkVPUoyScVb5seHn4p8v");

export const connection = new Connection(
    "https://devnet.helius-rpc.com/?api-key=634713f0-b4f2-41dc-af7f-ed7d60bd70e2", "confirmed"
  );

export const program = new Program(IDL, PROGRAM_ID, { connection });