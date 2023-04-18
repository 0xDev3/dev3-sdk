# Dev3 Chainlink SDK

Dev3 Chainlink module is a fully open source Typescript SDK which enables any frontend developer to fetch the prices of various assets through Chainlink DataFeeds.
Users can fetch price pairs, NFT floor price information & more...

## Getting started

Install the Dev3 SDK by typing in your npm project (Angular, React, vanilla npm, ...)

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

And simply fetch a price pair by calling the price feeds functionality on the SDK:

```ts
ethSDK.getFromOracle(ethSDK.feeds.AAVE_ETH).then(res => { console.log(res) })
```

## Modern development

Dev3 Chainlink SDK extracts all the pair contracts addresses for all networks that are compatible into code generated classes, so all 
modern editors will support full code autocomplete.

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

## License

Dev3 Chainlink SDK is fully open source, clonable & re-usable. Dev3 retains no rights to the code or implementations. 
