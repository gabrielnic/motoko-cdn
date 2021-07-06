import { Actor, HttpAgent, ActorSubclass } from '@dfinity/agent';
import { idlFactory, canisterId } from 'dfx-generated/backend';
import type { Principal } from "@dfinity/principal";


export interface Container {
  'getAllFiles' : () => Promise<[] | [Array<FileInfo>]>,
  'getFileChunk' : (arg_0: FileId, arg_1: bigint) => Promise<any>,
  'getFileInfo' : (arg_0: FileId) => Promise<[] | [FileData]>,
  'getStatus' : () => Promise<Array<[string, bigint]>>,
  'putFileChunks' : (
      arg_0: FileId,
      arg_1: bigint,
      arg_2: bigint,
      arg_3: Array<number>,
    ) => Promise<undefined>,
  'putFileInfo' : (arg_0: FileInfo) => Promise<[] | [FileId]>,
};
export type FileData = FileData_2;
export interface FileData_2 {
  'name' : string,
  'createdAt' : Timestamp,
  'size' : bigint,
  'fileId' : FileId_2,
  'chunkCount' : bigint,
  'extension' : FileExtension,
  'uploadedAt' : Timestamp,
};
export type FileExtension = { 'aac' : null } |
  { 'avi' : null } |
  { 'gif' : null } |
  { 'jpg' : null } |
  { 'mp3' : null } |
  { 'mp4' : null } |
  { 'png' : null } |
  { 'svg' : null } |
  { 'wav' : null } |
  { 'jpeg' : null };
export type FileId = FileId_2;
export type FileId_2 = string;
export type FileInfo = FileInfo_2;
export interface FileInfo_2 {
  'name' : string,
  'createdAt' : Timestamp,
  'size' : bigint,
  'chunkCount' : bigint,
  'extension' : FileExtension,
};
export type Timestamp = bigint;
export default Container;
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
