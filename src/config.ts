import { Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { IDL } from "idl/idl";

export const PROGRAM_ID: PublicKey = new PublicKey("5envej2Ue7gH2EnBHJsqCEyHrkVPUoyScVb5seHn4p8v");

export const connection = new Connection(
    "https://devnet.helius-rpc.com/?api-key=fd8837b0-d184-46e2-9894-e9bde8a446be", "confirmed"
  );

export const program = new Program(IDL, PROGRAM_ID, { connection });
