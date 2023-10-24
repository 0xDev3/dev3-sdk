import { ContractCallAction } from "../../core/actions/ContractCallAction";
import { MainApi } from "../../core/api/main-api";
import { fetchChainlinkContractsAddresses, readContract, signAndSendTransaction, writeContract } from "../../core/helpers/util";
import { EncodedFunctionParameter, VRFSubscriptionInfo } from "../../core/types";
import { ethers, TransactionResponse } from 'ethers';

export class VRFSubscription {
    public id: string = "";
    public balance: string = "";
    public requestCount: string = "";
    public owner: string = "";
    public consumers: string[] = [];
    public coordinatorAddress: string = "";
    public chainlinkTokenContractAddress: string = "";

    private constructor(subId: string) {
        this.id = subId;
    }

    static async fromSubId(subId: string): Promise<VRFSubscription> {
        const projectChainId = (await MainApi.instance().fetchProject()).chain_id.toString();
        const chainlinkContractsAddresses: any = await fetchChainlinkContractsAddresses();
        const subscription = new VRFSubscription(subId);
        subscription.coordinatorAddress = chainlinkContractsAddresses.get(projectChainId).vrf_coordinator_contract;
        subscription.chainlinkTokenContractAddress = chainlinkContractsAddresses.get(projectChainId).link_token_contract;
        const subscriptionInfo = await subscription.getInfo();
        subscription.balance = subscriptionInfo.balance;
        subscription.requestCount = subscriptionInfo.requestCount;
        subscription.owner = subscriptionInfo.owner;
        subscription.consumers = subscriptionInfo.consumers;
        return subscription;
    }

    public async getInfo(subId?: string): Promise<VRFSubscriptionInfo> {
        const callRequest = await readContract(
            this.coordinatorAddress,
            "getSubscription",
            [{ type: "uint64", value: subId ? subId : this.id }],
            ["uint96", "uint64", "address", "address[]"],
            "0x0"
        );
        this.balance = ethers.formatEther(callRequest.return_values[0]);
        this.requestCount = callRequest.return_values[1];
        this.owner = callRequest.return_values[2];
        this.consumers = Array.from(callRequest.return_values[3]);
        return this;
    }

    public async fund(amount: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const hexValue = ethers.AbiCoder.defaultAbiCoder().encode(["uint64"], [this.id])
        const bytes = ethers.getBytes(hexValue)
        const functionParameters = [
            { type: "address", value: this.coordinatorAddress },
            { type: "uint256", value: ethers.parseUnits(amount).toString() },
            {
                type: "bytes",
                value: options?.pk ? bytes : Array.from(bytes).map(it => it.toString())
            }
        ]
        if (options?.pk) {
            const parameterNames = ["to", "value", "data"]
            const transactionResponse = signAndSendTransaction(
                this.chainlinkTokenContractAddress,
                "transferAndCall",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        } else {
            return await writeContract(
                this.chainlinkTokenContractAddress,
                "transferAndCall",
                functionParameters as [EncodedFunctionParameter],
                "0"
            );
        }
    }

    public async cancel(toAddress: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [
            { type: "uint64", value: this.id },
            { type: "address", value: toAddress }
        ]
        if (options?.pk) {
            const parameterNames = ["subId", "to"]
            const transactionResponse = signAndSendTransaction(
                this.coordinatorAddress,
                "cancelSubscription",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        }
        else {
            return await writeContract(
                this.coordinatorAddress,
                "cancelSubscription",
                functionParameters,
                "0"
            );
        }
    }

    public async ownerCancel(options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [{ type: "uint64", value: this.id }]
        if (options?.pk) {
            const parameterNames = ["subId"]
            const transactionResponse = signAndSendTransaction(
                this.coordinatorAddress,
                "ownerCancelSubscription",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        }
        else {
            return await writeContract(
                this.coordinatorAddress,
                "ownerCancelSubscription",
                functionParameters,
                "0"
            );
        }
    }

    public async addConsumer(consumerAddress: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [
            { type: "uint64", value: this.id },
            { type: "address", value: consumerAddress }
        ]
        if (options?.pk) {
            const parameterNames = ["subId", "consumer"]
            const transactionResponse = signAndSendTransaction(
                this.coordinatorAddress,
                "addConsumer",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        } else {
            return await writeContract(
                this.coordinatorAddress,
                "addConsumer",
                functionParameters,
                "0"
            );
        }
    }

    public async removeConsumer(consumerAddress: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [
            { type: "uint64", value: this.id },
            { type: "address", value: consumerAddress }
        ]
        if (options?.pk) {
            const parameterNames = ["subId", "consumer"]
            const transactionResponse = signAndSendTransaction(
                this.coordinatorAddress,
                "removeConsumer",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        }
        else {
            return await writeContract(
                this.coordinatorAddress,
                "removeConsumer",
                functionParameters,
                "0"
            );
        }
    }

    public async acceptSubscriptionOwnerTransfer(options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [{ type: "uint64", value: this.id }]
        if (options?.pk) {
            const parameterNames = ["subId"]
            const transactionResponse = signAndSendTransaction(
                this.coordinatorAddress,
                "acceptSubscriptionOwnerTransfer",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        }
        else {
            return await writeContract(
                this.coordinatorAddress,
                "acceptSubscriptionOwnerTransfer",
                functionParameters,
                "0"
            );
        }
    }

    public async requestSubscriptionOwnerTransfer(newOwner: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [
            { type: "uint64", value: this.id },
            { type: "address", value: newOwner }
        ]
        if (options?.pk) {
            const parameterNames = ["subId", "newOwner"]
            const transactionResponse = signAndSendTransaction(
                this.coordinatorAddress,
                "requestSubscriptionOwnerTransfer",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        }
        else {
            return await writeContract(
                this.coordinatorAddress,
                "requestSubscriptionOwnerTransfer",
                functionParameters,
                "0"
            );
        }
    }
}
