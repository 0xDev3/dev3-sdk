import { fetchChainlinkContractsAddresses, getWeb3Provider, poll, readContract, signAndSendTransaction, writeContract } from "../../core/helpers/util";
import { FunctionsOracleRegistryConfig, FunctionsOracleRegistryRequestConfig } from "../../core/types";
import { FunctionSubscription } from "./FunctionSubscription";
import { MainApi } from "../../core/api/main-api";
import { TransactionReceipt } from 'ethers';

let chainlinkContractsAddresses: any;

export class FunctionsOracleRegistry {

    public address: string = "";
    public chainlinkTokenContractAddress: string = "";
    public web3provider: any;
    public projectChainId: string = "";

    constructor() { }

    public async init() {
        this.projectChainId = (await MainApi.instance().fetchProject()).chain_id.toString();
        chainlinkContractsAddresses = await fetchChainlinkContractsAddresses();
        this.address = chainlinkContractsAddresses.get(this.projectChainId).functions_oracle_registry;
        this.chainlinkTokenContractAddress = chainlinkContractsAddresses.get(this.projectChainId).link_token_contract;
        this.web3provider = await getWeb3Provider(this.projectChainId);
    }

    public async createSubscription(options?: { pk?: string }): Promise<FunctionSubscription> {
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

    public async getSubscription(subId: string): Promise<FunctionSubscription> {
        return FunctionSubscription.fromSubId(subId);
    }

    public async getAuthorizedSenders(): Promise<string[]> {
        const callRequest = await readContract(
            this.address,
            "getAuthorizedSenders",
            [],
            ["address[]"],
            "0x0"
        );
        return Array.from(callRequest.return_values[0]);
    }

    public async getConfig(): Promise<FunctionsOracleRegistryConfig> {
        const callRequest = await readContract(
            this.address,
            "getConfig",
            [],
            [
                "uint32",
                "uint32",
                "uint256",
                "uint256",
                "uint32",
                "address",
                "address"
            ],
            "0x0"
        );
        return {
            maxGasLimit: Number(callRequest.return_values[0]),
            stalenessSeconds: Number(callRequest.return_values[1]),
            gasAfterPaymentCalculation: Number(callRequest.return_values[2]),
            fallbackWeiPerUnitLink: Number(callRequest.return_values[3]),
            gasOverhead: Number(callRequest.return_values[4]),
            linkAddress: callRequest.return_values[5],
            linkPriceFeed: callRequest.return_values[6]
        }
    }

    public async getRequestConfig(): Promise<FunctionsOracleRegistryRequestConfig> {
        const callRequest = await readContract(
            this.address,
            "getRequestConfig",
            [],
            ["uint32", "address"],
            "0x0"
        );
        return {
            maxGasLimit: Number(callRequest.return_values[0]),
            authorizedSenders: Array.from(callRequest.return_values[1])
        }
    }
}