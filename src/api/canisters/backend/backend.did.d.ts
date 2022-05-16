import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Bucket {
  'generateRandom' : ActorMethod<[string], string>,
  'getChunks' : ActorMethod<[FileId__1, bigint], [] | [Array<number>]>,
  'getFileInfo' : ActorMethod<[FileId__1], [] | [FileData]>,
  'getInfo' : ActorMethod<[], Array<FileData>>,
  'getSize' : ActorMethod<[], bigint>,
  'putChunks' : ActorMethod<[FileId__1, bigint, Array<number>], [] | [null]>,
  'putFile' : ActorMethod<[FileInfo__1], [] | [FileId__1]>,
  'wallet_balance' : ActorMethod<[], bigint>,
  'wallet_receive' : ActorMethod<[], { 'accepted' : bigint }>,
}
export interface Container {
  'getAllFiles' : ActorMethod<[], any>,
  'getFileChunk' : ActorMethod<
    [FileId, bigint, Principal],
    [] | [Array<number>],
  >,
  'getFileInfo' : ActorMethod<[Principal], [] | [Principal]>,
  'getStatus' : ActorMethod<[], Array<[Principal, bigint]>>,
  'putFileChunks' : ActorMethod<
    [FileId, bigint, bigint, Array<number>],
    undefined,
  >,
  'putFileInfo' : ActorMethod<[FileInfo], [] | [FileId]>,
  'updateStatus' : ActorMethod<[], undefined>,
  'wallet_receive' : ActorMethod<[], undefined>,
}
export interface FileData {
  'cid' : Principal,
  'name' : string,
  'createdAt' : Timestamp,
  'size' : bigint,
  'fileId' : FileId__2,
  'chunkCount' : bigint,
  'extension' : FileExtension,
  'uploadedAt' : Timestamp,
}
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
export type FileId = string;
export type FileId__1 = string;
export type FileId__2 = string;
export interface FileInfo {
  'name' : string,
  'createdAt' : Timestamp,
  'size' : bigint,
  'chunkCount' : bigint,
  'extension' : FileExtension,
}
export interface FileInfo__1 {
  'name' : string,
  'createdAt' : Timestamp,
  'size' : bigint,
  'chunkCount' : bigint,
  'extension' : FileExtension,
}
export type Timestamp = bigint;
export interface _SERVICE extends Container {}
