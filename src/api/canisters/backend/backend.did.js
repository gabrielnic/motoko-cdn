export const idlFactory = ({ IDL }) => {
  const FileId = IDL.Text;
  const FileId__1 = IDL.Text;
  const Timestamp = IDL.Int;
  const FileId__2 = IDL.Text;
  const FileExtension = IDL.Variant({
    'aac' : IDL.Null,
    'avi' : IDL.Null,
    'gif' : IDL.Null,
    'jpg' : IDL.Null,
    'mp3' : IDL.Null,
    'mp4' : IDL.Null,
    'png' : IDL.Null,
    'svg' : IDL.Null,
    'wav' : IDL.Null,
    'jpeg' : IDL.Null,
  });
  const FileData = IDL.Record({
    'cid' : IDL.Principal,
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'size' : IDL.Nat,
    'fileId' : FileId__2,
    'chunkCount' : IDL.Nat,
    'extension' : FileExtension,
    'uploadedAt' : Timestamp,
  });
  const FileInfo__1 = IDL.Record({
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'size' : IDL.Nat,
    'chunkCount' : IDL.Nat,
    'extension' : FileExtension,
  });
  const Bucket = IDL.Service({
    'generateRandom' : IDL.Func([IDL.Text], [IDL.Text], []),
    'getChunks' : IDL.Func(
        [FileId__1, IDL.Nat],
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        ['query'],
      ),
    'getFileInfo' : IDL.Func([FileId__1], [IDL.Opt(FileData)], ['query']),
    'getInfo' : IDL.Func([], [IDL.Vec(FileData)], ['query']),
    'getSize' : IDL.Func([], [IDL.Nat], []),
    'putChunks' : IDL.Func(
        [FileId__1, IDL.Nat, IDL.Vec(IDL.Nat8)],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putFile' : IDL.Func([FileInfo__1], [IDL.Opt(FileId__1)], []),
    'wallet_balance' : IDL.Func([], [IDL.Nat], []),
    'wallet_receive' : IDL.Func(
        [],
        [IDL.Record({ 'accepted' : IDL.Nat64 })],
        [],
      ),
  });
  const FileInfo = IDL.Record({
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'size' : IDL.Nat,
    'chunkCount' : IDL.Nat,
    'extension' : FileExtension,
  });
  const Container = IDL.Service({
    'getAllFiles' : IDL.Func([], [IDL.Reserved], ['query']),
    'getFileChunk' : IDL.Func(
        [FileId, IDL.Nat, IDL.Principal],
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        [],
      ),
    'getFileInfo' : IDL.Func([IDL.Principal], [IDL.Opt(Bucket)], ['query']),
    'getStatus' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat))],
        ['query'],
      ),
    'putFileChunks' : IDL.Func(
        [FileId, IDL.Nat, IDL.Nat, IDL.Vec(IDL.Nat8)],
        [],
        [],
      ),
    'putFileInfo' : IDL.Func([FileInfo], [IDL.Opt(FileId)], []),
    'updateStatus' : IDL.Func([], [], []),
    'wallet_receive' : IDL.Func([], [], []),
  });
  return Container;
};
export const init = ({ IDL }) => { return []; };
