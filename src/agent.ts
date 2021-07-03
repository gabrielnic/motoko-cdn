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

export interface FileData {
  'name' : string,
  'createdAt' : Timestamp,
  'size' : bigint,
  'fileId' : FileId,
  'chunkCount' : bigint,
  'extension' : FileExtension,
  'uploadedAt' : Timestamp,
};
export interface Container {
  'getFileChunk' : (arg_0: FileId, arg_1: bigint) => Promise<
      [] | [Array<number>]
    >,
  'getFileInfo' : (arg_0: FileId) => Promise<[] | [FileData]>,
  'getStatus' : () => Promise<Array<[Principal, bigint]>>,
  'putFileChunks' : (
      arg_0: FileId,
      arg_1: bigint,
      arg_2: bigint,
      arg_3: Array<number>,
    ) => Promise<undefined>,
  'putFileInfo' : (arg_0: FileInfo) => Promise<[] | [FileId]>,
  'updateSize' : (arg_0: Principal) => Promise<undefined>,
  'test' : () => Promise<undefined>,
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
