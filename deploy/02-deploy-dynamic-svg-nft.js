const { network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    log("------------------------")

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const highSvg = await fs.readFileSync("./images/dynamicSvgNft/happy.svg", {
        encoding: "utf8",
    })
    const lowSvg = await fs.readFileSync("./images/dynamicSvgNft/frown.svg", { encoding: "utf8" })

    const args = [ethUsdPriceFeedAddress, networkConfig[chainId].mintFee, lowSvg, highSvg]
    const dynamicNft = await deploy("DynamicSvgNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dynamicNft.address, args)
    }
    log("------------------------")
}

module.exports.tags = ["all", "dynamicnft", "main"]
