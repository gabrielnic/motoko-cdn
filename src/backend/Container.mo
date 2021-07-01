import Array "mo:base/Array";
import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Buckets "Buckets";
import Types "./Types";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";

shared ({caller = owner}) actor class Container() {

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
    size : Nat;
  };

  private let canisterMap = HashMap.HashMap<Principal, Nat>(100, Principal.equal, Principal.hash);
  private let canisters : [var ?CanisterState<Bucket, Nat>] = Array.init(10, null);
  private let threshold = 2147483648;
  // private let threshold = 109715200; // Testing numbers

  func newEmptyBucket(): async Bucket {
    let b = await Buckets.Bucket(); // dynamically install a new Bucket
    let _ = await updateCanister(b);
    let size = await b.getSize();
    Debug.print(debug_show("principal"));
    Debug.print(debug_show(Principal.toText(Principal.fromActor(b))));
    let _ = canisterMap.put(Principal.fromActor(b), threshold - size);
    // Debug.print(debug_show(size));
     var v : CanisterState<Bucket, Nat> = {
         bucket = b;
         size = size;
    };
    canisters[1] := ?v;
  
    b;
  };

  func getEmptyBucket(): async Bucket {
    let cs: ?(?CanisterState<Bucket, Nat>) =  Array.find<?CanisterState<Bucket, Nat>>(Array.freeze(canisters), 
        func(v: ?CanisterState<Bucket, Nat>) : Bool {
          switch (v) {
            case null { false };
            case (?v) { v.size < threshold };
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
    Debug.print(debug_show("status"));
    let cid = { canister_id = Principal.fromActor(a)};
    Debug.print(debug_show(await IC.canister_status(cid)));

    // let cid = await IC.create_canister(  {
    //    settings = ?{controllers = [?(owner)]; compute_allocation = null; memory_allocation = ?(4294967296); freezing_threshold = null; } } );
    
    await (IC.update_settings( {
       canister_id = cid.canister_id; 
       settings = { controllers = ?[owner]; compute_allocation = ?10; memory_allocation = ?4294967296; freezing_threshold = ?0;} }));
  };

  public func getStatus() : async [(Principal, Nat)] {
    for (i in Iter.range(0, canisters.size() - 1)) {
      let c : ?CanisterState<Bucket, Nat> = canisters[i];
      switch c { 
        case null { };
        case (?c) {
          let b = c.bucket;
          let _ = await updateSize(b);
        };
      }
    };
    Iter.toArray<(Principal, Nat)>(canisterMap.entries());
  };

  public func updateSize(b : Bucket) : async () {
    let size = await b.getSize();
    Debug.print(debug_show(size));
    Debug.print(debug_show("principal"));
    Debug.print(debug_show(Principal.toText(Principal.fromActor(b))));
    let _ = canisterMap.replace(Principal.fromActor(b), threshold - size);
  };

  
  public func putFileChunks(fileId: FileId, chunkNum : Nat, chunkData : [Nat8]) : async () {
    let b : Bucket = await getEmptyBucket();
    let _ = await b.putChunks(fileId, chunkNum, chunkData);
  };

  public func putFileInfo(fi: FileInfo) : async ?FileId {
    let b: Bucket = await getEmptyBucket();
    Debug.print(debug_show(fi));
    let fileId = await b.putFile(fi);
    fileId
  };

  public func getFileChunk(fileId : FileId, chunkNum : Nat) : async ?[Nat8] {
    let b : Bucket = await getEmptyBucket();
    await b.getChunks(fileId, chunkNum);
   
  };

  public func getFileInfo(fileId : FileId) : async ?FileData {
    let b : Bucket = await getEmptyBucket();
    await b.getFileInfo(fileId)
  };

};

  