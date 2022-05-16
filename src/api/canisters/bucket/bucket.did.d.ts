import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Bucket {
  'generateRandom' : ActorMethod<[string], string>,
  'getChunks' : ActorMethod<[FileId, bigint], [] | [Array<number>]>,
  'getFileInfo' : ActorMethod<[FileId], [] | [FileData]>,
  'getInfo' : ActorMethod<[], Array<FileData>>,
  'getSize' : ActorMethod<[], bigint>,
  'putChunks' : ActorMethod<[FileId, bigint, Array<number>], [] | [null]>,
  'putFile' : ActorMethod<[FileInfo], [] | [FileId]>,
  'wallet_balance' : ActorMethod<[], bigint>,
  'wallet_receive' : ActorMethod<[], { 'accepted' : bigint }>,
}
export interface FileData {
  'cid' : Principal,
  'name' : string,
  'createdAt' : Timestamp,
  'size' : bigint,
  'fileId' : FileId__1,
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
export interface FileInfo {
  'name' : string,
  'createdAt' : Timestamp,
  'size' : bigint,
  'chunkCount' : bigint,
  'extension' : FileExtension,
}
export type Timestamp = bigint;
export interface _SERVICE extends Bucket {}
