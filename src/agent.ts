import { Actor, HttpAgent, ActorSubclass } from '@dfinity/agent';
import { idlFactory, canisterId } from 'dfx-generated/backend';
import type { Principal } from "@dfinity/principal";


export type FileId = string;

export interface FileInfo {
  'name' : string,
  'createdAt' : Timestamp,
  'size' : bigint,
  'chunkCount' : bigint,
  'extension' : FileExtension,
};

export type Timestamp = bigint;

export type FileExtension = {
  'aac' : null } |
{ 'avi' : null } |
{ 'gif' : null } |
{ 'jpg' : null } |
{ 'mp3' : null } |
{ 'mp4' : null } |
{ 'png' : null } |
{ 'svg' : null } |
{ 'wav' : null } |
{ 'jpeg' : null };


export interface Container {
  'getValue' : () => Promise<bigint>,
  'increment' : () => Promise<undefined>,
  'putFileChunks' : (
      arg_0: FileId,
      arg_1: bigint,
      arg_2: Array<number>,
    ) => Promise<undefined>,
  'putFileInfo' : (arg_0: FileInfo) => Promise<[] | [FileId]>,
  'whoami' : () => Promise<Principal>,
  'getSize' : () => Promise<bigint>,
  'getStatus' : () => Promise<Array<[Principal, bigint]>>,
};
const agentOptions = {
    host: 'http://localhost:8000',
  }



export async function getBackendActor(): Promise<ActorSubclass<Container>> {
  const agent = new HttpAgent(agentOptions);
  // for local development only, this must not be used for production
  await agent.fetchRootKey();
  const backend = Actor.createActor<Container>(idlFactory, { agent, canisterId: canisterId });

  return backend;
}
