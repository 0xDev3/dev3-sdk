import { VRFSubscription } from "./VRFSubscription";
import { getWeb3Provider, readContract, writeContract, fetchChainlinkContractsAddresses, signAndSendTransaction, poll } from '../../core/helpers/util';
import { MainApi } from '../../core/api/main-api';
import { VRFCoordinatorConfig } from '../../core/types';
import { TransactionReceipt } from 'ethers';

let chainlinkContractsAddresses: any;

export class VRFCoordinator {

    public address: string = "";
    public chainlinkTokenContractAddress: string = "";
    public web3provider: any;
    public projectChainId: string = "";

    constructor() { }

    public async init() {
        this.projectChainId = (await MainApi.instance().fetchProject()).chain_id.toString();
        chainlinkContractsAddresses = await fetchChainlinkContractsAddresses();
        this.address = chainlinkContractsAddresses.get(this.projectChainId).vrf_coordinator_contract;
        this.chainlinkTokenContractAddress = chainlinkContractsAddresses.get(this.projectChainId).link_token_contract;
        this.web3provider = await getWeb3Provider(this.projectChainId);
    }

    public async createSubscription(options?: { pk?: string }): Promise<VRFSubscription> {
        let transactionHash: string = "";
        if (options?.pk) {
            const transactionResponse = await signAndSendTransaction(
                this.address,
                "createSubscription",
                options.pk
            );
            transactionHash = transactionResponse.hash;
        } else {
            const subscription = await writeContract(
                this.address,
                "createSubscription",
                [],
                "0"
            );
            const result = await subscription.present();
            transactionHash = result.transactionHash as string;
        }
        const transactionReceipt = await poll<TransactionReceipt>(
            () => this.web3provider.getTransactionReceipt(transactionHash),
            (response) => response == null
        );
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
