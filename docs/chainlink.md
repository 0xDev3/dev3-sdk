# Dev3 Chainlink SDK

The Dev3 Chainlink SDK module is a fully open source Typescript SDK which enables any frontend developer to fetch the prices of various assets through Chainlink Data Feeds.
Users can fetch price pairs, NFT floor price information & more.

## Getting started

Install the Dev3 SDK in your npm project (Angular, React, vanilla npm, etc.). Type the following command on your terminal while on your project's root folder:

```sh
npm install dev3-sdk
```

In your JavaScript or TypeScript file import the Chainlink module:

```ts
import { Chainlink } from 'dev3-sdk'
```

Initialize the SDK by calling:

```ts
const ethSDK = Chainlink.instance('https://rpc-node-url.xx', Chainlink.PriceFeeds.ETH)
const avaxSDK = Chainlink.instance('https://avax-rpc-url.xx', Chainlink.PriceFeeds.AVAX)
```

Once the SDK is initialized, you can start consuming different feeds as outlined in the examples below.

### Price Feeds

```ts
// AAVE/ETH price feed
ethSDK.getFromOracle(ethSDK.feeds.AAVE_ETH).then((res) => {
    console.log(res.answer.toString());
});
```

### NFT Floor Price Feeds

```ts
// Azuki floor price
ethSDK.getFromOracle(ethSDK.feeds.AZUKI_FLOOR_ETH).then((res) => {
    console.log(res.answer.toString());
});
```

### Proof of Reserve Feeds
```ts
// EURS reserves
ethSDK.getFromOracle(ethSDK.feeds.EURS_RESERVES).then((res) => {
    console.log(res.answer.toString());
});
```

### Full list of feeds

You can find all available feeds by visiting [data.chain.link](https://data.chain.link/).

## Modern development

Dev3 Chainlink SDK extracts all the pair contracts addresses for all networks that are compatible into code generated classes, so all modern editors will support full code autocomplete.

![Screenshot 2023-03-31 at 17 48 26](https://user-images.githubusercontent.com/42938691/229169473-409e6fec-d183-416c-b0b3-db12f34fcf3c.png)

## Reading data

The data is returned in the form of an RoundDataModel object:

```ts
export interface RoundDataModel {
    roundID: BigNumber;
    answer: BigNumber;
    formattedAnswer?: string;
    startedAt: BigNumber;
    updatedAt: BigNumber;
    answeredInRound: BigNumber;
    assetName?: string;
    dataFeedName?: string;
}
```

## Chainlink Contracts Manifest files

Important Chainlink interfaces and contracts have been described by the Dev3 Manifest file standard and can be found here: [Interfaces](https://github.com/0xDev3/solidity-commons/tree/master/interfaces/chainlink) & [Deployable contracts](https://github.com/0xDev3/solidity-commons/tree/master/src/chainlink).

You can use them freely from within your frontends and/or wallets. To deploy them easily head over to the [Dev3 dashboard](https://app.dev3.sh/) and simply choose "Deploy from template" option in your workspace.

## Source code

The source code for this extension is extracted to the [GitHub repo](https://github.com/0xDev3/dev3-chainlink-sdk) so you can also use it as a standalone module.

## License

Dev3 Chainlink SDK is fully open source, clonable & re-usable. Dev3 retains no rights to the code or implementations. 
