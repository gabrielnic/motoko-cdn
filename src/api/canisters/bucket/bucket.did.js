export const idlFactory = ({ IDL }) => {
  const FileId = IDL.Text;
  const Timestamp = IDL.Int;
  const FileId__1 = IDL.Text;
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
    'fileId' : FileId__1,
    'chunkCount' : IDL.Nat,
    'extension' : FileExtension,
    'uploadedAt' : Timestamp,
  });
  const FileInfo = IDL.Record({
    'name' : IDL.Text,
    'createdAt' : Timestamp,
    'size' : IDL.Nat,
    'chunkCount' : IDL.Nat,
    'extension' : FileExtension,
  });
  const Bucket = IDL.Service({
    'generateRandom' : IDL.Func([IDL.Text], [IDL.Text], []),
    'getChunks' : IDL.Func(
        [FileId, IDL.Nat],
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        ['query'],
      ),
    'getFileInfo' : IDL.Func([FileId], [IDL.Opt(FileData)], ['query']),
    'getInfo' : IDL.Func([], [IDL.Vec(FileData)], ['query']),
    'getSize' : IDL.Func([], [IDL.Nat], []),
    'putChunks' : IDL.Func(
        [FileId, IDL.Nat, IDL.Vec(IDL.Nat8)],
        [IDL.Opt(IDL.Null)],
        [],
      ),
    'putFile' : IDL.Func([FileInfo], [IDL.Opt(FileId)], []),
    'wallet_balance' : IDL.Func([], [IDL.Nat], []),
    'wallet_receive' : IDL.Func(
        [],
        [IDL.Record({ 'accepted' : IDL.Nat64 })],
        [],
      ),
  });
  return Bucket;
};
export const init = ({ IDL }) => { return []; };
