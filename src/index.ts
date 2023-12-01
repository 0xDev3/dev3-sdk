import { PriceFeedsETH } from 'polycode-chainlink-feeds'
import { PriceFeedsAVAX } from 'polycode-chainlink-feeds'
import { PriceFeedsBSC } from 'polycode-chainlink-feeds'
import { PriceFeedModel } from 'polycode-chainlink-feeds';
import { PolycodeChainlinkSDK } from 'polycode-chainlink-feeds';

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

    static instance<T extends PriceFeedModel>(rpc: string, priceFeed: T): PolycodeChainlinkSDK<T> {
        return new PolycodeChainlinkSDK(rpc, priceFeed);
    }

}
