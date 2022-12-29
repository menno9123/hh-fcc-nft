const { developmentChains } = require("../helper-hardhat-config")
const { ethers } = require("hardhat")

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()

    //Mint basic NFT
    const basicNFT = await ethers.getContract("BasicNFT", deployer)
    const basicMintTx = await basicNFT.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 has tokenURI: ${await basicNFT.tokenURI(0)}`)

    //Mint Random IPFS NFT
    const randomNFT = await ethers.getContract("RandomIpfsNFT", deployer)
    const mintFee = await randomNFT.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 300000)
        randomNFT.once("NftMinted", async function () {
            resolve()
        })
        const randomMintTx = await randomNFT.requestNft({ value: mintFee.toString() })
        const randomMintTxReceipt = await randomMintTx.wait(1)
        if (developmentChains.includes(network.name)) {
            const requestId = randomMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomNFT.address)
        }
    })
    console.log(`Random IPFS NFT index 0 tokenURI: ${await randomNFT.tokenURI(0)}`)

    //Dynamic SVG NFT
    const dynamicNFT = ethers.getContract("DynamicSvgNFT", deployer)
    mintFee = dynamicNFT.getMintFee()
    const highValue = 2000
    await dynamicNFT.mintNft({ value: mintFee.toString() }, [0])
}
