import Types "./Types";
import Random "mo:base/Random";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Prim "mo:prim";

actor class Bucket () {

  type FileId = Types.FileId;
  type FileInfo = Types.FileInfo;
  type FileData = Types.FileData;
  type ChunkId = Types.ChunkId;
  type State = Types.State;

  var state = Types.empty();

  func generateRandom(): async Text {
      let b = await Random.blob();
      let random = Random.rangeFrom(64, b);
  
      Nat.toText(random)
  };

  func createFileInfo(fileId: Text, fi: FileInfo) : ?FileId {
          switch (state.files.get(fileId)) {
              case (?_) { /* error -- ID already taken. */ null }; 
              case null { /* ok, not taken yet. */
                  state.files.put(fileId,
                                      {
                                          fileId = fileId;
                                          name = fi.name ;
                                          createdAt = fi.createdAt;
                                          uploadedAt = Time.now();
                                          chunkCount = fi.chunkCount;
                                          size = fi.size ;
                                          extension = fi.extension;
                                      }
                  );
                  ?fileId
              };
          }
  };

  public func putFile(fi: FileInfo) : async ?FileId {
    do ? {
      // gererate a random ID 
      let fileId = await generateRandom();
      createFileInfo(fileId, fi)!;
    }
  };

  func chunkId(fileId : FileId, chunkNum : Nat) : ChunkId {
      fileId # (Nat.toText(chunkNum))
  };

  public func putChunks(fileId : FileId, chunkNum : Nat, chunkData : [Nat8]) : async ?() {
    do ? {
      state.chunks.put(chunkId(fileId, chunkNum), chunkData);
    }
  };

  public func getSize(): async Nat {
    Prim.rts_memory_size();
  };

  func getFileInfoData(fileId : FileId) : ?FileData {
      do ? {
          let v = state.files.get(fileId)!;
            {
            fileId = fileId;
            name = v.name;
            size = v.size;
            chunkCount = v.chunkCount;
            extension = v.extension;
            createdAt = v.createdAt;
            uploadedAt = v.uploadedAt;
          }
      }
  };

  public query func getFileInfo(fileId : FileId) : async ?FileData {
    do ? {
      getFileInfoData(fileId)!
    }
  };
  public query func getChunks(fileId : FileId, chunkNum: Nat) : async ?[Nat8] {
    do ? {
      state.chunks.get(chunkId(fileId, chunkNum))!
    }
  };

};
