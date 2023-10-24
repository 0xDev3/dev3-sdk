import { ContractCallAction } from "../../core/actions/ContractCallAction";
import { MainApi } from "../../core/api/main-api";
import { fetchChainlinkContractsAddresses, readContract, signAndSendTransaction, writeContract } from "../../core/helpers/util";
import { EncodedFunctionParameter, UpkeepInfo } from "../../core/types";
import { ethers, TransactionResponse } from 'ethers';

export class Upkeep {
    public id: string = "";
    public balance: string = "";
    public minBalance: string = "";
    public targetContract: string = "";
    public admin: string = "";
    public executeGas: string = "";
    public maxValidBlockNumber: string = "";
    public lastPerformBlockNumber: string = "";
    public amountSpent: string = "";
    public paused: boolean = false;
    public checkData: string = "";
    public offchainConfig: string = "";
    public keeperRegistryContractAddress: string = "";
    public chainlinkTokenContractAddress: string = "";

    private constructor(subId: string) {
        this.id = subId;
    }

    static async fromUpkeepId(subId: string): Promise<Upkeep> {
        const projectChainId = (await MainApi.instance().fetchProject()).chain_id.toString();
        const chainlinkContractsAddresses: any = await fetchChainlinkContractsAddresses();
        const upkeep = new Upkeep(subId);
        upkeep.keeperRegistryContractAddress = chainlinkContractsAddresses.get(projectChainId).keeper_registry_contract;
        upkeep.chainlinkTokenContractAddress = chainlinkContractsAddresses.get(projectChainId).link_token_contract;
        const upkeepInfo = await upkeep.getInfo();
        upkeep.balance = upkeepInfo.balance;
        upkeep.targetContract = upkeepInfo.targetContract;
        upkeep.admin = upkeepInfo.admin;
        upkeep.executeGas = upkeepInfo.executeGas;
        upkeep.maxValidBlockNumber = upkeepInfo.maxValidBlockNumber;
        upkeep.lastPerformBlockNumber = upkeepInfo.lastPerformBlockNumber;
        upkeep.amountSpent = upkeepInfo.amountSpent;
        upkeep.paused = upkeepInfo.paused;
        upkeep.checkData = upkeepInfo.checkData;
        upkeep.offchainConfig = upkeepInfo.offchainConfig;
        return upkeep;
    }

    public async getInfo(subId?: string): Promise<UpkeepInfo> {
        const callRequest = await readContract(
            this.keeperRegistryContractAddress,
            "getUpkeep",
            [{ type: "uint256", value: subId ? subId : this.id }],
            [{ type: "tuple", elems: ["address", "uint32", "bytes", "uint96", "address", "uint64", "uint32", "uint96", "bool", "bytes"] }],
            "0x0"
        );
        const returnValues = callRequest.return_values[0];
        this.targetContract = returnValues[0];
        this.executeGas = returnValues[1];
        this.checkData = returnValues[2];
        this.balance = ethers.formatEther(returnValues[3]);
        this.admin = returnValues[4];
        this.maxValidBlockNumber = returnValues[5];
        this.lastPerformBlockNumber = returnValues[6];
        this.amountSpent = returnValues[7];
        this.paused = Boolean(returnValues[8]);
        this.offchainConfig = returnValues[9];

        const minBalanceCallRequest = await readContract(
            this.keeperRegistryContractAddress,
            "getMinBalanceForUpkeep",
            [
                { type: "uint256", value: subId ? subId : this.id },
            ],
            ["uint96"],
            "0x0"
        );
        this.minBalance = ethers.formatEther(minBalanceCallRequest.return_values[0]);
        return this;
    }

    public async fund(amount: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const hexValue = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [this.id])
        const bytes = ethers.getBytes(hexValue)
        const functionParameters = [
            { type: "address", value: this.keeperRegistryContractAddress },
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

    public async pauseUpkeep(options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [{ type: "uint256", value: this.id }]
        if (options?.pk) {
            const parameterNames = ["id"]
            const transactionResponse = signAndSendTransaction(
                this.keeperRegistryContractAddress,
                "pauseUpkeep",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        } else {
            return await writeContract(
                this.keeperRegistryContractAddress,
                "pauseUpkeep",
                functionParameters,
                "0"
            );
        }
    }

    public async unpauseUpkeep(options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [{ type: "uint256", value: this.id }]
        if (options?.pk) {
            const parameterNames = ["id"]
            const transactionResponse = signAndSendTransaction(
                this.keeperRegistryContractAddress,
                "unpauseUpkeep",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        } else {
            return await writeContract(
                this.keeperRegistryContractAddress,
                "unpauseUpkeep",
                functionParameters,
                "0"
            );
        }
    }

    public async setGasLimit(limit: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [
            { type: "uint256", value: this.id },
            { type: "uint32", value: limit },
        ]
        if (options?.pk) {
            const parameterNames = ["id", "gasLimit"]
            const transactionResponse = signAndSendTransaction(
                this.keeperRegistryContractAddress,
                "setUpkeepGasLimit",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        } else {
            return await writeContract(
                this.keeperRegistryContractAddress,
                "setUpkeepGasLimit",
                functionParameters,
                "0"
            );
        }
    }

    public async setUpkeepOffchainConfig(offchainConfig: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const hexValue = ethers.AbiCoder.defaultAbiCoder().encode(["string"], [offchainConfig])
        const bytes = ethers.getBytes(hexValue)
        const functionParameters = [
            { type: "uint256", value: this.id },
            { type: "bytes", value: options?.pk ? bytes : Array.from(bytes).map(it => it.toString()) },
        ]
        if (options?.pk) {
            const parameterNames = ["id", "config"]
            const transactionResponse = signAndSendTransaction(
                this.keeperRegistryContractAddress,
                "setUpkeepOffchainConfig",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        } else {
            return await writeContract(
                this.keeperRegistryContractAddress,
                "setUpkeepOffchainConfig",
                functionParameters as [EncodedFunctionParameter],
                "0"
            );
        }
    }

    public async cancel(options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [{ type: "uint256", value: this.id }]
        if (options?.pk) {
            const parameterNames = ["id"]
            const transactionResponse = signAndSendTransaction(
                this.keeperRegistryContractAddress,
                "cancelUpkeep",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        } else {
            return await writeContract(
                this.keeperRegistryContractAddress,
                "cancelUpkeep",
                functionParameters,
                "0"
            );
        }
    }

    public async transferUpkeepAdmin(newOwner: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [
            { type: "uint256", value: this.id },
            { type: "address", value: newOwner }
        ]
        if (options?.pk) {
            const parameterNames = ["id", "proposed"]
            const transactionResponse = signAndSendTransaction(
                this.keeperRegistryContractAddress,
                "transferUpkeepAdmin",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        } else {
            return await writeContract(
                this.keeperRegistryContractAddress,
                "transferUpkeepAdmin",
                functionParameters,
                "0"
            );
        }
    }

    public async acceptUpkeepAdmin(options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [{ type: "uint256", value: this.id }]
        if (options?.pk) {
            const parameterNames = ["id"]
            const transactionResponse = signAndSendTransaction(
                this.keeperRegistryContractAddress,
                "acceptUpkeepAdmin",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        } else {
            return await writeContract(
                this.keeperRegistryContractAddress,
                "acceptUpkeepAdmin",
                functionParameters,
                "0"
            );
        }
    }

    public async withdrawFunds(address: string, options?: { pk?: string }): Promise<ContractCallAction | TransactionResponse> {
        const functionParameters = [
            { type: "uint256", value: this.id },
            { type: "address", value: address }
        ]
        if (options?.pk) {
            const parameterNames = ["id", "to"]
            const transactionResponse = signAndSendTransaction(
                this.keeperRegistryContractAddress,
                "withdrawFunds",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            return transactionResponse;
        } else {
            return await writeContract(
                this.keeperRegistryContractAddress,
                "withdrawFunds",
                functionParameters,
                "0"
            );
        }
    }
}
