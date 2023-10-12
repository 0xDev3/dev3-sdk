import { PriceFeedsETH } from 'dev3-chainlink-feeds'
import { PriceFeedsAVAX } from 'dev3-chainlink-feeds'
import { PriceFeedsBSC } from 'dev3-chainlink-feeds'
import { PriceFeedModel } from 'dev3-chainlink-feeds';
import { Dev3ChainlinkSDK } from 'dev3-chainlink-feeds';

import DkgClient from "dkg.js";

export { Dev3SDK } from './core/sdk';
export { MainApi as Dev3API } from './core/api/main-api';
export { VRFSubscription } from './chainlink/vrf/VRFSubscription';
export { VRFCoordinator } from './chainlink/vrf/VRFCoordinator';
export { FunctionsOracleRegistry } from './chainlink/functions/FunctionsOracleRegistry';
export { FunctionSubscription } from './chainlink/functions/FunctionSubscription';
export { KeeperRegistry } from './chainlink/upkeep/KeeperRegistry';
export { Upkeep } from './chainlink/upkeep/Upkeep';
export { DkgClient }

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
