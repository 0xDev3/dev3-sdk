import { TransactionResponse, ethers } from "ethers";
import { ContractCallAction } from "../../core/actions/ContractCallAction";
import { MainApi } from "../../core/api/main-api";
import { fetchChainlinkContractsAddresses, readContract, signAndSendTransaction, writeContract } from "../../core/helpers/util";
import { EncodedFunctionParameter, FunctionSubscriptionInfo } from "../../core/types";

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
        subscription.functionsRegistryAddress = chainlinkContractsAddresses.get(projectChainId).functions_oracle_registry;
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
        this.balance = ethers.formatEther(callRequest.return_values[0]);
        this.owner = callRequest.return_values[1];
        this.authorizedConsumers = Array.from(callRequest.return_values[2]);
        return this;
    }

    public async fund(amount: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const hexValue = ethers.AbiCoder.defaultAbiCoder().encode(["uint64"], [this.id])
        const bytes = ethers.getBytes(hexValue)
        const functionParameters = [
            { type: "address", value: this.functionsRegistryAddress },
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

    public async addConsumer(consumerAddress: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [
            { type: "uint64", value: this.id },
            { type: "address", value: consumerAddress }
        ]
        if (options?.pk) {
            const parameterNames = ["subscriptionId", "consumer"]
            const transactionResponse = signAndSendTransaction(
                this.functionsRegistryAddress,
                "addConsumer",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        } else {
            return await writeContract(
                this.functionsRegistryAddress,
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
            const parameterNames = ["subscriptionId", "consumer"]
            const transactionResponse = signAndSendTransaction(
                this.functionsRegistryAddress,
                "removeConsumer",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        }
        else {
            return await writeContract(
                this.functionsRegistryAddress,
                "removeConsumer",
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
            const parameterNames = ["subscriptionId", "newOwner"]
            const transactionResponse = signAndSendTransaction(
                this.functionsRegistryAddress,
                "requestSubscriptionOwnerTransfer",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        }
        else {
            return await writeContract(
                this.functionsRegistryAddress,
                "requestSubscriptionOwnerTransfer",
                functionParameters,
                "0"
            );
        }
    }

    public async acceptSubscriptionOwnerTransfer(options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [{ type: "uint64", value: this.id }]
        if (options?.pk) {
            const parameterNames = ["subscriptionId"]
            const transactionResponse = signAndSendTransaction(
                this.functionsRegistryAddress,
                "acceptSubscriptionOwnerTransfer",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        }
        else {
            return await writeContract(
                this.functionsRegistryAddress,
                "acceptSubscriptionOwnerTransfer",
                functionParameters,
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
            const parameterNames = ["subscriptionId", "to"]
            const transactionResponse = signAndSendTransaction(
                this.functionsRegistryAddress,
                "cancelSubscription",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        }
        else {
            return await writeContract(
                this.functionsRegistryAddress,
                "cancelSubscription",
                functionParameters,
                "0"
            );
        }
    }
}