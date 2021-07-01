import Hash "mo:base/Hash";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Trie "mo:base/Trie";
import TrieMap "mo:base/TrieMap";

module {
  
  public type Service = actor {
    getFileInfo : shared FileId -> async ?FileData;
    getSize : shared () -> async Nat;
    putChunks : shared (FileId, Nat, [Nat8]) -> async ?();
    putFile : shared FileInfo -> async ?FileId;
  };
  
  public type Timestamp = Int; // See mo:base/Time and Time.now()

  public type FileId = Text;

  public type ChunkData = [Nat8]; // encoded as ???

  public type ChunkId = Text; 
  

  public type FileExtension = {
    #jpeg;
    #jpg;
    #png;
    #gif;
    #svg;
    #mp3;
    #wav;
    #aac;
    #mp4;
    #avi;
  };

  public type FileInfo = {
    createdAt : Timestamp;
    chunkCount: Nat;    
    name: Text;
    size: Nat;
    extension: FileExtension;
  }; 

  public type FileData = {
    fileId : FileId;
    uploadedAt : Timestamp;
    createdAt : Timestamp;
    chunkCount: Nat;    
    name: Text;
    size: Nat;
    extension: FileExtension;
  };

  public type Map<X, Y> = TrieMap.TrieMap<X, Y>;

  public type State = {
      files : Map<FileId, FileData>;
      // all chunks.
      chunks : Map<ChunkId, ChunkData>;
  };

  public func empty () : State {
    let st : State = {
      files = TrieMap.TrieMap<FileId, FileData>(Text.equal, Text.hash);
      chunks = TrieMap.TrieMap<ChunkId, ChunkData>(Text.equal, Text.hash);
    };
    st
  };


  
}