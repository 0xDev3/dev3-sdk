import { ethers } from "ethers";
import { ContractCallAction } from "../../core/actions/ContractCallAction";
import { MainApi } from "../../core/api/main-api";
import { fetchChainlinkContractsAddresses, readContract, writeContract } from "../../core/helpers/util";
import { FunctionSubscriptionInfo } from "../../core/types";


export class FunctionSubscription {
    public id: string = "";
    public owner: string = "";
    public balance: string = "";
    public authorizedConsumers: string[] = [];
    public functionsRegistryAddress: string = "";
    public chainlinkTokenContractAddress: string = "";

    private constructor(subId: string) {
        this.id = subId;
    }

    static async fromSubId(subId: string): Promise<FunctionSubscription> {
        const projectChainId = (await MainApi.instance().fetchProject()).chain_id.toString();
        const chainlinkContractsAddresses: any = await fetchChainlinkContractsAddresses();
        const subscription = new FunctionSubscription(subId);
        subscription.functionsRegistryAddress = chainlinkContractsAddresses.get(projectChainId).functions_registry_contract;
        subscription.chainlinkTokenContractAddress = chainlinkContractsAddresses.get(projectChainId).link_token_contract;
        const subscriptionInfo = await subscription.getInfo();
        subscription.balance = subscriptionInfo.balance;
        subscription.owner = subscriptionInfo.owner;
        subscription.authorizedConsumers = subscriptionInfo.authorizedConsumers;
        return subscription;
    }

    public async getInfo(subId?: string): Promise<FunctionSubscriptionInfo> {
        const callRequest = await readContract(
            this.functionsRegistryAddress,
            "getSubscription",
            [{ type: "uint64", value: subId ? subId : this.id }],
            ["uint96", "address", "address[]"],
            "0x0"
        );
        this.balance = ethers.utils.formatEther(callRequest.return_values[0]);
        this.owner = callRequest.return_values[1];
        this.authorizedConsumers = Array.from(callRequest.return_values[2]);
        return this;
    }

    public async fund(amount: string): Promise<ContractCallAction> {
        const hexValue = ethers.utils.defaultAbiCoder.encode(["uint64"], [this.id])
        return await writeContract(
            this.chainlinkTokenContractAddress,
            "transferAndCall",
            [
                { type: "address", value: this.functionsRegistryAddress },
                { type: "uint256", value: ethers.utils.parseUnits(amount).toString() },
                { type: "bytes", value: Array.from(ethers.utils.arrayify(hexValue)).map(it => it.toString()) },
            ],
            "0"
        );
    }

    public async addConsumer(consumerAddress: string): Promise<ContractCallAction> {
        return await writeContract(
            this.functionsRegistryAddress,
            "addConsumer",
            [
                { type: "uint64", value: this.id },
                { type: "address", value: consumerAddress }
            ],
            "0"
        );
    }

    public async removeConsumer(consumerAddress: string): Promise<ContractCallAction> {
        return await writeContract(
            this.functionsRegistryAddress,
            "removeConsumer",
            [
                { type: "uint64", value: this.id },
                { type: "address", value: consumerAddress }
            ],
            "0"
        );
    }

    public async requestSubscriptionOwnerTransfer(newOwner: string): Promise<ContractCallAction> {
        return await writeContract(
            this.functionsRegistryAddress,
            "requestSubscriptionOwnerTransfer",
            [
                { type: "uint64", value: this.id },
                { type: "address", value: newOwner }
            ],
            "0"
        );
    }

    public async acceptSubscriptionOwnerTransfer(): Promise<ContractCallAction> {
        return await writeContract(
            this.functionsRegistryAddress,
            "acceptSubscriptionOwnerTransfer",
            [
                { type: "uint64", value: this.id }
            ],
            "0"
        );
    }

    public async cancel(toAddress: string): Promise<ContractCallAction> {
        return await writeContract(
            this.functionsRegistryAddress,
            "cancelSubscription",
            [
                { type: "uint64", value: this.id },
                { type: "address", value: toAddress }
            ],
            "0"
        );
    }

    public async ownerCancel(): Promise<ContractCallAction> {
        return await writeContract(
            this.functionsRegistryAddress,
            "ownerCancelSubscription",
            [
                { type: "uint64", value: this.id }
            ],
            "0"
        );
    }

}