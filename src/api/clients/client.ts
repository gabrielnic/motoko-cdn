import { createActor as _containerActor } from "../canisters/backend";
import { _SERVICE as _CONTAINERSERVICE } from "../canisters/backend/backend.did";
import { createActor as _bucketActor } from "../canisters/bucket";
import { _SERVICE as _BUCKETSERVICE } from "../canisters/bucket/bucket.did";

export abstract class GroupClient {
  static host =
    process.env.NODE_ENV === "production"
      ? "https://mainnet.dfinity.network"
      : "http://localhost:8000";

  // gets canister id from enviroment variable
  static containerActor = (): _CONTAINERSERVICE => {
    return _containerActor(process.env.BACKEND_CANISTER_ID!, {
      agentOptions: {
        host: this.host,
        // identity: YOUR_IDENTITY
      },
    });
  };

  // gets canister id from container canister
  static bucketActor = (canisterId: string): _BUCKETSERVICE => {
    return _bucketActor(canisterId, {
      agentOptions: {
        host: this.host,
        // identity: YOUR_IDENTITY
      },
    });
  };

  static async getAvailableCanister() {
    // let bucketCanisterId = await this.containerActor().getAvailableBucket();
    // let response = await this.bucketActor(bucketCanisterId).putChunks(DATA);
  }
}
