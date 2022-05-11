// const { expect } = require("chai");
// const { ethers, waffle } = require("hardhat");
// const {MerkleTree} = require("merkletreejs")
// const sha256 = require('js-sha256').sha256;
// const Web3Utils = require('web3-utils');

// function toHex64(s){
//     var hex = s.substring(2);
//     while(hex.length < 64){
//         hex = "0" + hex;
//     }
//     return "0x" + hex;
// }

// describe("Contract functions Merkle premint test", function () {

//     let Contract;
//     let hardhatToken;
//     let owner;
//     let addr1;
//     let addr2;
//     let whitelistAddresses;
//     let rootHash;
//     let merkleTree;

//     beforeEach(async function () {
//         Contract = await ethers.getContractFactory("Crew");
//         [owner, addr1, addr2] = await ethers.getSigners();
//         hardhatToken = await Contract.deploy();

//         //construct merkle tree
//         whitelistAddresses = [
//             owner.address,
//             "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
//             "0x32Be343B94f860124dC4fEe278FDCBD38C102D88"
//         ]
//         const leafNodes = whitelistAddresses.map(addr => sha256(Web3Utils.hexToBytes(toHex64(addr))));
//         merkleTree = new MerkleTree(leafNodes, sha256, {sortPairs: true})
        
//         rootHash = merkleTree.getRoot();

//     });

//     describe("Tests of reverted transactions", function () {

//         it("Should revert due to premint is not active", async function () {

//             await expect( hardhatToken.mintNFTDuringPresale(1, [])).to.be.revertedWith('Premint is not active now!');
//         });

//         it("Should revert due to wrong proof", async function () {
//             const proof = [];

//             await hardhatToken.setPremintActive(true);

//             await expect( hardhatToken.mintNFTDuringPresale(1, proof)).to.be.revertedWith('You are not allowed to mint at this phase!');
//         });

//         it("Should revert due to exceeded supply", async function () {
            
//             const hexAddress =  sha256(Web3Utils.hexToBytes(toHex64(owner.address)))
//             const supply = 3;
//             const proof = merkleTree.getHexProof(hexAddress);

//             await hardhatToken.setSupply(supply);
//             await hardhatToken.setPremintActive(true);
//             await hardhatToken.setRoot(rootHash)
            
//             for (let i = 0; i < supply; i++) {
//                 await hardhatToken.mintNFTDuringPresale(1, proof,{ value: ethers.utils.parseEther("0.36") });
//             }

//             await expect(hardhatToken.mintNFTDuringPresale(1, proof,{ value: ethers.utils.parseEther("0.36") })).to.be
//             .revertedWith("There are less non minted tokens than you are trying to mint!");
//         });

//         it("Should revert due to trying to mint more than one token in one transaction", async function () {
            
//             const hexAddress =  sha256(Web3Utils.hexToBytes(toHex64(owner.address)))
//             const proof = merkleTree.getHexProof(hexAddress);

//             await hardhatToken.setPremintActive(true);
//             await hardhatToken.setRoot(rootHash);

//             await expect(hardhatToken.mintNFTDuringPresale(2, proof,{ value: ethers.utils.parseEther("0.72") })).to.be
//             .revertedWith("You are trying to mint too many tokens!");
//         });

//         it("Should revert due to not added to whitelist address", async function () {
            
//             const hexAddress =  sha256(Web3Utils.hexToBytes(toHex64(addr1.address)))
//             const proof = merkleTree.getHexProof(hexAddress);

//             await hardhatToken.setPremintActive(true);
//             await hardhatToken.setRoot(rootHash);

//             await expect(hardhatToken.connect(addr1).mintNFTDuringPresale(2, proof,{ value: ethers.utils.parseEther("0.72") })).to.be
//             .revertedWith('You are not allowed to mint at this phase!');
//         });
//     });
    
//     describe("Tests of success transactions", function () {

//         it("Should mint one token", async function () {
            
//             const hexAddress =  sha256(Web3Utils.hexToBytes(toHex64(owner.address)))
//             const proof = merkleTree.getHexProof(hexAddress);

//             await hardhatToken.setPremintActive(true);
//             await hardhatToken.setRoot(rootHash);
//             await hardhatToken.mintNFTDuringPresale(1, proof,{ value: ethers.utils.parseEther("0.36") });
            
//             expect(await hardhatToken.totalSupply()).to.equal(1);
//         });
//     });
// });