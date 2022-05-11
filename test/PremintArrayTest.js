const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Contract functions array premint test", function () {

    let Contract;
    let hardhatToken;
    let owner;
    let addr1;
    let addr2;
    let addr3;

    beforeEach(async function () {
        Contract = await ethers.getContractFactory("CrewWithArray");
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        hardhatToken = await Contract.deploy();
    });

   

    describe("Tests of reverted transactions", function () {

        it("Should revert due to premint is not active", async function () {

            await expect( hardhatToken.mintNFTDuringPresale(1)).to.be.revertedWith('Premint is not active now!');
        });

        it("Should revert due to not contained in whitelist", async function () {
            
            const addresses = [addr1.address, addr2.address];
            const amounts = [2, 2];

            await hardhatToken.addToWhitelist(addresses, amounts);
            await hardhatToken.setPremintActive(true);
            
            await expect(hardhatToken.connect(addr3).mintNFTDuringPresale(1)).to.be
            .revertedWith("You are not allowed to mint this amount of tokens!");
        });

        it("Should revert due to not allowed amount of tokens", async function () {
            
            const addresses = [addr1.address, addr2.address, addr3.address];
            const amounts = [2, 2, 2];

            await hardhatToken.addToWhitelist(addresses, amounts);
            await hardhatToken.setPremintActive(true);
            
            await expect(hardhatToken.connect(addr3).mintNFTDuringPresale(3)).to.be
            .revertedWith("You are not allowed to mint this amount of tokens!");
        });

        it("Should revert second transaction of mint due to not allowed amount of tokens", async function () {
            
            const addresses = [addr1.address, addr2.address, addr3.address];
            const amounts = [2, 2, 2];

            await hardhatToken.addToWhitelist(addresses, amounts);
            await hardhatToken.setPremintActive(true);
            await hardhatToken.connect(addr3).mintNFTDuringPresale(2, { value: ethers.utils.parseEther("0.72") });
            
            await expect(hardhatToken.connect(addr3).mintNFTDuringPresale(1)).to.be
            .revertedWith("You are not allowed to mint this amount of tokens!");
        });
        
        it("Should revert due to exceeded supply", async function () {
            
            const supply = 3; 
            const addresses = [addr1.address, addr2.address, addr3.address];
            const amounts = [3, 3, 3];


            await hardhatToken.setSupply(supply);
            await hardhatToken.setPremintActive(true);
            await hardhatToken.addToWhitelist(addresses, amounts);
            
            for (let i = 0; i < supply; i++) {
                await hardhatToken.connect(addr1).mintNFTDuringPresale(1, { value: ethers.utils.parseEther("0.36") });
            }

            await expect(hardhatToken.connect(addr2).mintNFTDuringPresale(1,{ value: ethers.utils.parseEther("0.36") })).to.be
            .revertedWith("There are less non minted tokens than you are trying to mint!");
        });
    });
    
    describe("Tests of success transactions", function () {

        it("Should not be called because only owner can add to whitelist", async function () {

            const addresses = [addr1.address, addr2.address, addr3.address];
            const amounts = [3, 3, 3];

            await expect(hardhatToken.connect(addr1).addToWhitelist(addresses, amounts))
            .to.be.revertedWith("Ownable: caller is not the owner");
        });
        
        it("Should mint exactly one token to a specific address", async function () {
            
            const addresses = [addr1.address, addr2.address, addr3.address];
            const amounts = [3, 3, 3];

            await hardhatToken.setPremintActive(true);
            await hardhatToken.addToWhitelist(addresses, amounts);
            await hardhatToken.connect(addr2).mintNFTDuringPresale(1, { value: ethers.utils.parseEther("0.36") })

            expect(await hardhatToken.totalSupply()).to.equal(1);
            expect(await hardhatToken.ownerOf(0)).to.equal(addr2.address);
        });

        
        it("Should mint several tokens to a specific address", async function () {
            
            const numToMint = 5;
            const addresses = [addr1.address, addr2.address, addr3.address];
            const amounts = [numToMint, numToMint, numToMint];
            const cost = 2;
          
            await hardhatToken.setCost(cost);
            await hardhatToken.setPremintActive(true);
            await hardhatToken.addToWhitelist(addresses, amounts);
            await hardhatToken.connect(addr2).mintNFTDuringPresale(numToMint, { value: numToMint*cost })

            expect(await hardhatToken.totalSupply()).to.equal(numToMint);
            
            for (let i = 0; i < numToMint; i++) {
                expect(await hardhatToken.ownerOf(i)).to.equal(addr2.address);
            }
        });
    // it("Should mint one token", async function () {
            
        //         const hexAddress =  sha256(Web3Utils.hexToBytes(toHex64(owner.address)))
        //         const proof = merkleTree.getHexProof(hexAddress);
    
        //         await hardhatToken.setPremintActive(true);
        //         await hardhatToken.setRoot(rootHash);
        //         await hardhatToken.mintNFTDuringPresale(1, proof,{ value: ethers.utils.parseEther("0.36") });
                
        //         expect(await hardhatToken.totalSupply()).to.equal(1);
        //     });
    //     it("Should mint one token to a specific address", async function () {
            
    //         const hexAddress =  sha256(Web3Utils.hexToBytes(toHex64(owner.address)))
    //         const proof = merkleTree.getHexProof(hexAddress);

    //         await hardhatToken.setPremintActive(true);
    //         await hardhatToken.setRoot(rootHash);
    //         await hardhatToken.mintNFTDuringPresale(1, proof,{ value: ethers.utils.parseEther("0.36") });
            
    //         expect(await hardhatToken.totalSupply()).to.equal(1);
    //     });
    });
});
// function addToWhitelist(
//     address[] calldata _addresses,
//     uint256[] calldata _amounts
// ) public onlyOwner {
//     for (uint256 j; j < _addresses.length; j++) {
//         whitelist[_addresses[j]] = _amounts[j];
//     }
// }
// function mintNFTDuringPresale(
//     uint256 _numOfTokens
// ) 
//     public 
//         payable
// {
//     require(isPremintActive, 'Premint is not active now!');
//     require(whitelist[msg.sender] >= _numOfTokens, "You are not allowed to mint this amount of tokens!");
//     require(totalSupply().add(_numOfTokens) <= supply, "There are less non minted tokens than you are trying to mint!");
//     require(cost == msg.value, "Ether amount is not correct");
//     whitelist[msg.sender] = whitelist[msg.sender] + _numOfTokens;
//     _safeMint(msg.sender, totalSupply());
// }