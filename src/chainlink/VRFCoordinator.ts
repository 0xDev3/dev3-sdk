import { VRFSubscription } from "./VRFSubscription";
import { ContractCallAction } from '../core/actions/ContractCallAction';
import { readContract, writeContract } from '../core/helpers/util';
import { ethers } from 'ethers';
import { MainApi } from '../core/api/main-api';
import { VRFCoordinatorConfig } from '../core/types';


let chainlist: any;
let tokenAndCoordinatorAddresses: any;


async function fetchChainlist() {
    const chainlistResponse = await fetch(
        'https://raw.githubusercontent.com/0xpolyflow/polyflow-sdk/master/resources/chainlist.json'
    );
    const chainlistJson = await chainlistResponse.json();
    chainlist = new Map(Object.entries(chainlistJson));
}

async function fetchTokenAndCoordinatorAddresses() {
    const tokenAndCoordinatorAddressesResponse = await fetch(
        'https://raw.githubusercontent.com/0xpolyflow/polyflow-sdk/master/resources/chainlink_contract_and_coordinator.json'
    );
    const tokenAndCoordinatorAddressesJson = await tokenAndCoordinatorAddressesResponse.json();
    tokenAndCoordinatorAddresses = new Map(Object.entries(tokenAndCoordinatorAddressesJson));
}


export class VRFCoordinator {

    public subscriptions: VRFSubscription[] = [];
    public address: string = "";
    public chainlinkTokenContractAddress: string = "";
    public web3provider: any;
    public projectChainId: number = 0;

    constructor() { }

    public async init() {
        this.projectChainId = (await MainApi.instance().fetchProject()).chain_id;
        await fetchTokenAndCoordinatorAddresses();
        this.address = tokenAndCoordinatorAddresses.get(this.projectChainId).vrf_coordinator_contract;
        this.chainlinkTokenContractAddress = tokenAndCoordinatorAddresses.get(this.projectChainId).link_token_contract;
    }

    public async createSubscription(): Promise<VRFSubscription> {
        if (!this.web3provider) {
            await fetchChainlist();
            this.web3provider = new ethers.providers.JsonRpcProvider(chainlist.get(this.projectChainId));
        };
        const subscription = await writeContract(
            this.address,
            "createSubscription",
            [],
            "0"
        );
        console.log(subscription);
        const action = new ContractCallAction(subscription);
        const result = await action.present();
        const transactionHash = result.transactionHash as string;
        const transactionReceipt = await this.web3provider.getTransactionReceipt(transactionHash);
        const subId = parseInt(transactionReceipt.logs[0].topics[1]);
        return await this.getSubscription(subId.toString());
    }

    public async getSubscription(subId: string): Promise<VRFSubscription> {
        let subscription = this.subscriptions.find(sub => sub.id === subId);
        if (subscription) return subscription;
        subscription = new VRFSubscription();
        subscription.id = subId;
        const callRequest = await readContract(
            this.address,
            "getSubscription",
            [{ type: "uint64", value: subId }],
            ["uint96", "uint64", "address", "address[]"],
            "0x0"
        );
        subscription.balance = callRequest.return_values[0];
        subscription.requestCount = callRequest.return_values[1];
        subscription.owner = callRequest.return_values[2];
        subscription.consumers = Array.from(callRequest.return_values[3]);
        subscription.coordinatorAddress = this.address;
        subscription.chainlinkTokenContractAddress = this.chainlinkTokenContractAddress;
        this.subscriptions.push(subscription);
        return subscription;
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