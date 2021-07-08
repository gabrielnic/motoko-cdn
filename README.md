[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Naereen/StrapDown.js/graphs/commit-activity)
 <a href="https://circleci.com/gh/badges/shields/tree/master">
        <img src="https://img.shields.io/circleci/project/github/badges/shields/master" alt="build status"></a>
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)




<!-- PROJECT LOGO -->
<br />
<p align="center">
  
  <h3 align="center">A simple storage auto-scaling solution across multiple canisters. Ie: mini-bigmap</h3>

  <p align="center">
    <a href="https://b2r3f-wiaaa-aaaae-aaaxa-cai.ic0.app/">View Demo</a>
  </p>
</p>

## Motivation
While everyone is waiting on BigMap I decided to build a scaling generic solution for storage. 

## About The Project
The core architecture relies on actor classes that allows canister creation on the fly. 
The container actor stores an array of all the canisters created on the fly and the size of that canisters. 

In order to get a canister memory size I'm using `rts_memory_size`: the rts_memory_size is the current size of the Wasm memory array (mostly the same as the canister memory size). This can only grow, never shrink in Wasm, even if most of it is unused. However, unused/unmodified canister memory ought to have no cost on the IC.

You can use the IC management canister interface to get the memory of a canister as well ie: `IC.status ` but rts_memory_size and IC.status numbers are not the same - the implementation will do some more work before and after after you call rts_memory_size (deserializing arguments and serializing results, which may affect memory size after you’ve read it. So you can use either but from my tests `rts_memory_size` is closer to reality. 

Due to the way garbage collector is built in motoko (takes about half of the canister memory so a bit less than 2GB) and from my tests I decided to set a threshold of 2GB  `private let threshold = 2147483648; //  ~2GB` so once the threshold is reached the container will spawn a new canister for storage. `Note`: you only pay for what you consume. 

https://sdk.dfinity.org/docs/interface-spec/index.html#ic-management-canister

Using the IC management canister I can update the new canister settings `compute_allocation = ?5; memory_allocation = ?4294967296;` and the controllers to the wallet canister and the container canister. 

Random IDs: I generate a random id in js and then using Random library https://sdk.dfinity.org/docs/base-libraries/random I use 2 bytes of entropy and append to the id sent from front-end. This way I use a blob of entropy for 16 IDs. 

Frontend: you can upload any type of file from this category: `jpeg, gif, jpg, png, svg, avi, aac, mp4, wav, mp3` but you can update the front-end `getFileExtension` to allow/remove types. 

Files are split in chunks of 500Kb and uploaded into an available bucket. 

Main characteristics:
* create canisters dynamically and keep track of them in a container
* store blobs of data in buckets 


### Built With

* [Motoko](https://sdk.dfinity.org/docs/quickstart/quickstart-intro.html)
* [ReactJS](https://reactjs.org/)

<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/gabrielnic/motoko-cdn
   ```
2. Install NPM packages
   ```sh
   yarn
   ```
3. Start dfx
   ```sh
   dfx start --clean
   ```
4. Deploy
   ```sh
   dfx deploy
   ```


<!-- USAGE EXAMPLES -->
## Usage
Copy front-end canister id from .dfx/local/canister_ids.json and replace in the url below
 

Navigate to http://<frontend_canister_id>.localhost:8000/

![Imgur Image](https://i.imgur.com/OGeUlz4.png)

<!-- ROADMAP -->
## Roadmap
1. Inter canister query calls. For now every bucket call is an update call so it needs to reach consesus making it slow and expensive. 
2. Store blobs of data in multiple canisters. For now you can only upload files smaller than the threshold ie: 2GB
3. Test for race condition when multiple people are uploading into a single bucket.
4. Increase threshold once the new garbage collector is released (couple of weeks)

See the [open issues](https://github.com/gabrielnic/motoko-cdn/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## Thanks

Many thanks to Claudio, Janesh and Nico from Dfinity team for all the help. 



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.
