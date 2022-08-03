const localNftMarketplace = require("./localhost/NftMarketplace.json");
const localBasicNft = require("./localhost/BasicNft.json");

const rinkebyNftMarketplace = require("./rinkeby/NftMarketplace.json");
const rinkebyBasicNft = require("./rinkeby/BasicNft.json");

const loadDeployedNftMarketplaceContract = (network) => {
  if (network === "localhost") {
    return localNftMarketplace;
  } else if (network === "rinkeby") {
    return rinkebyNftMarketplace;
  }
  return null;
};

const loadDeployedBasicNftContract = (network) => {
  if (network === "localhost") {
    return localBasicNft;
  } else if (network === "rinkeby") {
    return rinkebyBasicNft;
  }
  return null;
};

const networkMapping = {
  31337: "localhost",
  4: "rinkeby",
};

module.exports = {
  loadDeployedNftMarketplaceContract,
  loadDeployedBasicNftContract,
  networkMapping,
};
