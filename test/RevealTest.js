const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Contract functions test which are related to reveal", function () {

    let Contract;
    let hardhatToken;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        Contract = await ethers.getContractFactory("Crew");
        [owner, addr1, addr2] = await ethers.getSigners();
        hardhatToken = await Contract.deploy();

        //start sale and mint NFT to create token
        await hardhatToken.setMintActive(true);
        await hardhatToken.publicMint(1, { value:  hardhatToken.cost()});
    });

    describe("", function () {

        it("Should contain false in reveal field after init", async function () {

            expect(await hardhatToken.reveal()).to.equal(false);
        });

        it("Should change reveal field", async function () {

            await hardhatToken.makeReveal();

            expect(await hardhatToken.reveal()).to.equal(true);
        });
        
        it("Should return mockUri if reveal not happened", async function () {
            const mockUri = "/mockUri";

            await hardhatToken.setMockUri(mockUri);
            
            expect(await hardhatToken.tokenURI(0)).to.equal(mockUri);
        });

        it("Should return token uri if reveal happened", async function () {
            const uri = "metadataUri/";
            
            await hardhatToken.setUri(uri);
            await hardhatToken.makeReveal();
            
            expect(await hardhatToken.tokenURI(0)).to.equal(uri + "0");
        });
    });
});