import { VRFSubscription } from "./VRFSubscription";
import { readContract, writeContract, fetchChainlist, fetchTokenAndCoordinatorAddresses } from '../../core/helpers/util';
import { JsonRpcProvider } from 'ethers';
import { MainApi } from '../../core/api/main-api';
import { VRFCoordinatorConfig } from '../../core/types';

let chainlist: any;
let tokenAndCoordinatorAddresses: any;

export class VRFCoordinator {

    public address: string = "";
    public chainlinkTokenContractAddress: string = "";
    public web3provider: any;
    public projectChainId: string = "";

    constructor() { }

    public async init() {
        this.projectChainId = (await MainApi.instance().fetchProject()).chain_id.toString();
        tokenAndCoordinatorAddresses = await fetchTokenAndCoordinatorAddresses();
        this.address = tokenAndCoordinatorAddresses.get(this.projectChainId).vrf_coordinator_contract;
        this.chainlinkTokenContractAddress = tokenAndCoordinatorAddresses.get(this.projectChainId).link_token_contract;
    }

    public async createSubscription(): Promise<VRFSubscription> {
        if (!this.web3provider) {
            chainlist = await fetchChainlist();
            
            this.web3provider = new JsonRpcProvider(chainlist.get(this.projectChainId));
        };
        const subscription = await writeContract(
            this.address,
            "createSubscription",
            [],
            "0"
        );
        const result = await subscription.present();
        const transactionHash = result.transactionHash as string;
        const transactionReceipt = await this.web3provider.getTransactionReceipt(transactionHash);
        const subId = parseInt(transactionReceipt.logs[0].topics[1]);
        return await this.getSubscription(subId.toString());
    }

    public async getSubscription(subId: string): Promise<VRFSubscription> {
        return VRFSubscription.fromSubId(subId);
    }

    public async getConfig(): Promise<VRFCoordinatorConfig> {
        const callRequest = await readContract(
            this.address,
            "getConfig",
            [],
            ["uint16", "uint32", "uint32", "uint32"],
            "0x0"
        );
        return {
            minimumRequestConfirmations: Number(callRequest.return_values[0]),
            maxGasLimit: Number(callRequest.return_values[1]),
            stalenessSeconds: Number(callRequest.return_values[2]),
            gasAfterPaymentCalculation: Number(callRequest.return_values[3])
        }
    }

    public async getTotalBalance(): Promise<string> {
        const callRequest = await readContract(
            this.address,
            "getTotalBalance",
            [],
            ["uint96"],
            "0x0"
        );
        return callRequest.return_values[0];
    }
}
