const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Contract common functions test", function () {

  let Contract;
  let hardhatToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    Contract = await ethers.getContractFactory("Crew");
    [owner, addr1, addr2] = await ethers.getSigners();
    // const waffleProvider = waffle.provider;
    // const balance0ETH = await waffleProvider.getBalance(owner.address);
    // console.log(balance0ETH);
    hardhatToken = await Contract.deploy();
  });

  describe("Setters", function () {

      it("Should set the right cost", async function () {

        await hardhatToken.setCost(22)

        expect(await hardhatToken.cost()).to.equal(22);
      });

      it("Should set mint active", async function () {

        await hardhatToken.setMintActive(true)

        expect(await hardhatToken.isMintActive()).to.equal(true);
      });

      it("Should set mint active", async function () {

        await hardhatToken.setMintActive(true)

        expect(await hardhatToken.isMintActive()).to.equal(true);
      });

      it("Should set PREmint active", async function () {

        await hardhatToken.setPremintActive(true)

        expect(await hardhatToken.isPremintActive()).to.equal(true);
      });


      // it("Should set new uri", async function () {

      //   const newURI = "new uri";

      //   await hardhatToken.setUri(newURI)

      //   expect(await hardhatToken.uri()).to.equal(newURI);
      // });



      //   it("Should assign the total supply of tokens to the owner", async function () {
      //     const ownerBalance = await hardhatToken.balanceOf(owner.address);
      //     expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
      //   });
    });

    // You can nest describe calls to create subsections.
    describe("Other common functions", function () {

      it("Should return the right supply", async function () {

        expect(await hardhatToken.supply()).to.equal(10000);

      });

      it("Should have not active mint in initial state", async function () {

        expect(await hardhatToken.isMintActive()).to.equal(false);
      });

      it("Should have not active PREmint in initial state", async function () {

        expect(await hardhatToken.isPremintActive()).to.equal(false);
      });

      it("Should withdraw to new owner address (check by calling withdraw function)", async function () {

        const newOwnerAccount = addr1;
        const newOwnerBalanceBefore = await waffle.provider.getBalance(newOwnerAccount.address);

        //start sale and mint NFT to send Ether in contract
        await hardhatToken.setMintActive(true);

        await hardhatToken.connect(addr2).publicMint(1, { value:  hardhatToken.cost()});
        await hardhatToken.setOwnerAddress(newOwnerAccount.address)

        await hardhatToken.withdraw();

        const newOwnerBalanceAfter = await waffle.provider.getBalance(newOwnerAccount.address);
        await expect(newOwnerBalanceAfter).to.be.above(newOwnerBalanceBefore)
      });


      it("Check administrative functions to be called only with contract owner", async function () {

        await hardhatToken.setMintActive(true)

        expect(await hardhatToken.isMintActive()).to.equal(true);
      });

      it("Should not be called because only owner can withdraw", async function () {

        await expect(hardhatToken.connect(addr1).withdraw())
          .to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should withdraw ethers to master account", async function () {
        const masterAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
        const masterBalanceBefore = await waffle.provider.getBalance(masterAccount);

        //start sale and mint NFT to send Ether in contract
        await hardhatToken.setMintActive(true);
        await hardhatToken.connect(addr1).publicMint(1, { value: ethers.utils.parseEther("0.36") });

        await hardhatToken.connect(owner).withdraw();

        const masterBalanceAfter = await waffle.provider.getBalance(masterAccount);
        await expect(masterBalanceAfter).to.be.above(masterBalanceBefore)
      });


      it("Should revert tokenId function if token not exists", async function () {

        await expect(hardhatToken.tokenURI(1)).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");
      });
    function publicMint(
      uint256 _numOfTokens
    )
      public
      payable
    {
      require(isMintActive, 'Public mint is not active now!');
      require(_numOfTokens <= maxMint, "You are trying to mint too many tokens!");
      require(totalSupply().add(_numOfTokens) <= supply, "There are less non minted tokens than you are trying to mint!");
      require(cost.mul(_numOfTokens) == msg.value, "Ether amount is not correct");

      for(uint j = 0; j < _numOfTokens; j++) {
        _safeMint(msg.sender, totalSupply());
      }
    }
    });
    describe("Public mint functions", function () {

      it("Should revert due to not active mint", async function () {

        await expect(hardhatToken.publicMint(1)).to.be.revertedWith("Public mint is not active now!");
      });

      it("Should revert due to trying to mint more than possible in one transaction", async function () {

        const maxMint = await hardhatToken.maxMint();
        await hardhatToken.setMintActive(true);

        await expect(hardhatToken.publicMint(maxMint + 1)).to.be.revertedWith("You are trying to mint too many tokens!");
      });
      
      it("Should revert due to token sold out", async function () {

        const supply = 3;

        await hardhatToken.setSupply(supply);
        await hardhatToken.setMintActive(true);
        for (let i = 0; i < supply; i++) {
          await hardhatToken.connect(addr1).publicMint(1, { value: ethers.utils.parseEther("0.36") });
        }

        await expect(hardhatToken.publicMint(1)).to.be
        .revertedWith("There are less non minted tokens than you are trying to mint!");
      });

      it("Should revert due to wrong ether amount", async function () {

        const cost = 2;

        await hardhatToken.setCost(cost);
        await hardhatToken.setMintActive(true);

        await expect(hardhatToken.publicMint(1, { value: cost-1})).to.be
        .revertedWith("Ether amount is not correct");
      });

      it("Should revert due to wrong ether amoun when mint several tokens", async function () {

        const cost = 2;

        await hardhatToken.setCost(cost);
        await hardhatToken.setMintActive(true);
        
        await expect(hardhatToken.publicMint(2, { value: 2*cost-1})).to.be
        .revertedWith("Ether amount is not correct");
      });

      it("Should mint one token", async function () {

        const cost = 2;

        await hardhatToken.setCost(cost);
        await hardhatToken.setMintActive(true);
        await hardhatToken.publicMint(1, { value: cost});
        
        expect(await hardhatToken.totalSupply()).to.equal(1);
      });

      it("Should mint multiple tokens", async function () {

        const cost = 2;
        const numOfTokens = await hardhatToken.maxMint() - 1;

        await hardhatToken.setCost(cost);
        await hardhatToken.setMintActive(true);
        await hardhatToken.publicMint(numOfTokens, { value: numOfTokens*cost});
        
        expect(await hardhatToken.totalSupply()).to.equal(numOfTokens);
      });

      it("Should mint one token to a specific address", async function () {

        const cost = 2;

        await hardhatToken.setCost(cost);
        await hardhatToken.setMintActive(true);
        await hardhatToken.publicMint(1, { value: cost});
        
        expect(await hardhatToken.balanceOf(owner.address)).to.equal(1);
        //minted token id is 0 because at the moment of transaction the total supply was equal to 0
        expect(await hardhatToken.ownerOf(0)).to.equal(owner.address);
      });
    });
  });
  await addr1.sendTransaction({to:owner.address, value:ethers.utils.parseEther("1000")});
  console.log(await waffleProvider.getBalance(hardhatToken.address));

});