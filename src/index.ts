import { PriceFeedsETH } from 'dev3-chainlink-sdk/lib/data-feeds/ETH-data-feed'
import { PriceFeedsAVAX } from 'dev3-chainlink-sdk/lib/data-feeds/avax-data-feed'
import { PriceFeedsBSC } from 'dev3-chainlink-sdk/lib/data-feeds/bsc-data-feed'
import { PriceFeedModel } from 'dev3-chainlink-sdk/lib/types/price-feeds-model';
import { Dev3ChainlinkSDK } from 'dev3-chainlink-sdk/lib/src/dev3-sdk';

export { Dev3SDK } from './core/sdk';
export { MainApi as Dev3API } from './core/api/main-api';

export class Chainlink {

    static PriceFeeds = {
        ETH: new PriceFeedsETH(),
        AVAX: new PriceFeedsAVAX(),
        BSC: new PriceFeedsBSC()
    }

    static instance<T extends PriceFeedModel>(rpc: string, priceFeed: T): Dev3ChainlinkSDK<T> {
        return new Dev3ChainlinkSDK(rpc, priceFeed);
    }

}
