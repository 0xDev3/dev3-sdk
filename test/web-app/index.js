
import { Dev3SDK } from "../../src";
const sdk = new Dev3SDK(
  "xq4t4.kLwGGIYqN9+CbMgZkb/YyHA88dxadoCsU/tte30",
  "10499b05-3b8f-446b-bbc1-2ed3427e3ddc"
);

async function mintButtonClicked() {
    console.log("clicked");
  // Fetch NFT contract from Dev3 (contract was imported through Dashboard)
  const nftContract = await sdk.getContractByAlias("demo-rmrk");

  // Authorize the user and get a verified wallet address
  const walletAuth = await sdk.authorizeWallet();

  // Open the popup and get the user with their wallet
  const user = await walletAuth.present();

  const txHashHolder = document.getElementById("txhash-holder");

  // If user closes the window or fails auth
  if (user == null) {
    txHashHolder.innerText = "Auth failed";
    return;
  }

  // Get amount to mint from input
  const mintAmount = document.getElementById("mintInput").value;

  // Create a mint action
  const mintAction = await nftContract.buildAction("mint", [
    user.wallet,
    mintAmount
  ]);

  // Open the transaction modal and execute the mint function
  const result = await mintAction.present();

  // If user closes the window or fails the mint
  if (result == null) {
    txHashHolder.innerText = "Minting failed";
    return;
  }

  // Put txHash into the container
  document.getElementById("txhash-holder").innerText = result.transactionHash;
}

// Bind mint function with button
document
  .getElementById("mintButton")
  .addEventListener("click", mintButtonClicked);
