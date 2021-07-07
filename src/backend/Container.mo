import Array "mo:base/Array";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Buckets "Buckets";
import Types "./Types";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Blob "mo:base/Blob";
import Buffer "mo:base/Buffer";

shared ({caller = owner}) actor class Container() = this {

 public type canister_id = Principal;
  public type canister_settings = {
    freezing_threshold : ?Nat;
    controllers : ?[Principal];
    memory_allocation : ?Nat;
    compute_allocation : ?Nat;
  };
  public type definite_canister_settings = {
    freezing_threshold : Nat;
    controllers : [Principal];
    memory_allocation : Nat;
    compute_allocation : Nat;
  };
  public type user_id = Principal;
  public type wasm_module = [Nat8];

  let IC = actor "aaaaa-aa" : actor {
    canister_status : shared { canister_id : canister_id } -> async {
      status : { #stopped; #stopping; #running };
      memory_size : Nat;
      cycles : Nat;
      settings : definite_canister_settings;
      module_hash : ?[Nat8];
    };
    create_canister : shared { settings : ?canister_settings } -> async {
      canister_id : canister_id;
    };
    delete_canister : shared { canister_id : canister_id } -> async ();
    deposit_cycles : shared { canister_id : canister_id } -> async ();
    install_code : shared {
        arg : [Nat8];
        wasm_module : wasm_module;
        mode : { #reinstall; #upgrade; #install };
        canister_id : canister_id;
      } -> async ();
    provisional_create_canister_with_cycles : shared {
        settings : ?canister_settings;
        amount : ?Nat;
      } -> async { canister_id : canister_id };
    provisional_top_up_canister : shared {
        canister_id : canister_id;
        amount : Nat;
      } -> async ();
    raw_rand : shared () -> async [Nat8];
    start_canister : shared { canister_id : canister_id } -> async ();
    stop_canister : shared { canister_id : canister_id } -> async ();
    uninstall_code : shared { canister_id : canister_id } -> async ();
    update_settings : shared {
        canister_id : Principal;
        settings : canister_settings;
      } -> async ();
    };

  type Bucket = Buckets.Bucket;
  type Service = Types.Service;
  type FileId = Types.FileId;
  type FileInfo = Types.FileInfo;
  type FileData = Types.FileData;

  type CanisterState<Bucket, Nat> = {
    bucket  : Bucket;
    var size : Nat;
  };

  // private let canisterMap = HashMap.HashMap<Principal, Nat>(100, Principal.equal, Principal.hash);
  private let canisterMap = HashMap.HashMap<Text, Nat>(100, Text.equal, Text.hash);
  private let canisters : [var ?CanisterState<Bucket, Nat>] = Array.init(10, null);
  private let threshold = 2147483648;
  // private let threshold = 50715200; // Testing numbers ~ 50mb

  func newEmptyBucket(): async Bucket {
    let b = await Buckets.Bucket(); // dynamically install a new Bucket
    let _ = await updateCanister(b);
    let s = await b.getSize();
    Debug.print("new canister principal is " # debug_show(Principal.toText(Principal.fromActor(b))) );
    Debug.print("initial size is " # debug_show(s));
    let _ = canisterMap.put(Principal.toText(Principal.fromActor(b)), threshold);
     var v : CanisterState<Bucket, Nat> = {
         bucket = b;
         var size = s;
    };
    canisters[1] := ?v;
  
    b;
  };

  func getEmptyBucket(s : ?Nat): async Bucket {
    let fs: Nat = switch (s) {
      case null { 0 };
      case (?s) { s }
    };
    let cs: ?(?CanisterState<Bucket, Nat>) =  Array.find<?CanisterState<Bucket, Nat>>(Array.freeze(canisters), 
        func(cs: ?CanisterState<Bucket, Nat>) : Bool {
          switch (cs) {
            case null { false };
            case (?cs) {
              Debug.print("found canister with principal..." # debug_show(Principal.toText(Principal.fromActor(cs.bucket))));
              // calculate is there is enough space in canister for the new file.
              cs.size + fs < threshold 
            };
          };
      });
    let eb : ?Bucket = do ? {
        let c = cs!;
        let nb: ?Bucket = switch (c) {
          case (?c) { ?(c.bucket) };
          case _ { null };
        };

        nb!;
    };
    let c: Bucket = switch (eb) {
        case null { await newEmptyBucket() };
        case (?eb) { eb };
    };
    c
  };

  func updateCanister(a: actor {}) : async () {
    Debug.print("balance before: " # Nat.toText(Cycles.balance()));
    // Cycles.add(Cycles.balance()/2);
    let cid = { canister_id = Principal.fromActor(a)};
    Debug.print("IC status..."  # debug_show(await IC.canister_status(cid)));
    // let cid = await IC.create_canister(  {
    //    settings = ?{controllers = [?(owner)]; compute_allocation = null; memory_allocation = ?(4294967296); freezing_threshold = null; } } );
    
    await (IC.update_settings( {
       canister_id = cid.canister_id; 
       settings = { controllers = ?[owner, Principal.fromActor(this)]; compute_allocation = ?10; memory_allocation = ?4294967296; freezing_threshold = null} })
    );
  };

  public func getStatus() : async [(Text, Nat)] {
    for (i in Iter.range(0, canisters.size() - 1)) {
      let c : ?CanisterState<Bucket, Nat> = canisters[i];
      switch c { 
        case null { };
        case (?c) {
          let s = await c.bucket.getSize();
          let cid = { canister_id = Principal.fromActor(c.bucket)};
          Debug.print("IC status..." # debug_show(await IC.canister_status(cid)));
          Debug.print("canister with id: " # debug_show(Principal.toText(Principal.fromActor(c.bucket))) # " size is " # debug_show(s));
          c.size := s;
          let _ = updateSize(Principal.toText(Principal.fromActor(c.bucket)), s);
        };
      }
    };
    Iter.toArray<(Text, Nat)>(canisterMap.entries());
  };

  func updateSize(p: Text, s: Nat) : () {
    var r = 0;
    if (s < threshold) {
      r := threshold - s;
    };
    let _ = canisterMap.replace(p, r);
  };

  
  public func putFileChunks(fileId: FileId, chunkNum : Nat, fileSize: Nat, chunkData : Blob) : async () {
    let b : Bucket = await getEmptyBucket(?fileSize);
    let _ = await b.putChunks(fileId, chunkNum, chunkData);
  };

  public func putFileInfo(fi: FileInfo) : async ?FileId {
    let b: Bucket = await getEmptyBucket(?fi.size);
    Debug.print("creating file info..." # debug_show(fi));
    let fileId = await b.putFile(fi);
    fileId
  };

  public func getFileChunk(fileId : FileId, chunkNum : Nat) : async ?Blob {
    let b : Bucket = await getEmptyBucket(null);
    await b.getChunks(fileId, chunkNum);
  };

  public func getFileInfo(fileId : FileId) : async ?FileData {
    let b : Bucket = await getEmptyBucket(null);
    await b.getFileInfo(fileId)
  };

  public func getAllFiles() : async [FileData] {
    let buff = Buffer.Buffer<FileData>(0);
    for (i in Iter.range(0, canisters.size() - 1)) {
      let c : ?CanisterState<Bucket, Nat> = canisters[i];
      switch c { 
        case null { };
        case (?c) {
          let bi = await c.bucket.getBucketInfo();
          for (j in Iter.range(0, bi.size() - 1)) {
            buff.add(bi[j])
          };
        };
      }
    };
    buff.toArray()
  };  

};

  