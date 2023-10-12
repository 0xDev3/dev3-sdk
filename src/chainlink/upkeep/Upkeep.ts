import { ContractCallAction } from "../../core/actions/ContractCallAction";
import { MainApi } from "../../core/api/main-api";
import { fetchChainlinkContractsAddresses, readContract, writeContract } from "../../core/helpers/util";
import { UpkeepInfo } from "../../core/types";
import { ethers } from 'ethers';

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

    public async fund(amount: string): Promise<ContractCallAction> {
        const hexValue = ethers.AbiCoder.defaultAbiCoder().encode(["uint256"], [this.id])
        return await writeContract(
            this.chainlinkTokenContractAddress,
            "transferAndCall",
            [
                { type: "address", value: this.keeperRegistryContractAddress },
                { type: "uint256", value: ethers.parseUnits(amount).toString() },
                { type: "bytes", value: Array.from(ethers.getBytes(hexValue)).map(it => it.toString()) },
            ],
            "0"
        );
    }

    public async pauseUpkeep(): Promise<ContractCallAction> {
        return await writeContract(
            this.keeperRegistryContractAddress,
            "pauseUpkeep",
            [
                { type: "uint256", value: this.id },
            ],
            "0"
        );
    }

    public async unpauseUpkeep(): Promise<ContractCallAction> {
        return await writeContract(
            this.keeperRegistryContractAddress,
            "unpauseUpkeep",
            [
                { type: "uint256", value: this.id },
            ],
            "0"
        );
    }

    public async setGasLimit(limit: string): Promise<ContractCallAction> {
        return await writeContract(
            this.keeperRegistryContractAddress,
            "setUpkeepGasLimit",
            [
                { type: "uint256", value: this.id },
                { type: "uint32", value: limit },
            ],
            "0"
        );
    }

    public async setUpkeepOffchainConfig(offchainConfig: string): Promise<ContractCallAction> {
        const hexValue = ethers.AbiCoder.defaultAbiCoder().encode(["string"], [offchainConfig])
        return await writeContract(
            this.keeperRegistryContractAddress,
            "setUpkeepOffchainConfig",
            [
                { type: "uint256", value: this.id },
                { type: "bytes", value: Array.from(ethers.getBytes(hexValue)).map(it => it.toString()) },
            ],
            "0"
        );
    }

    public async cancel(): Promise<ContractCallAction> {
        return await writeContract(
            this.keeperRegistryContractAddress,
            "cancelUpkeep",
            [
                { type: "uint256", value: this.id },
            ],
            "0"
        );
    }

    public async transferUpkeepAdmin(newOwner: string): Promise<ContractCallAction> {
        return await writeContract(
            this.keeperRegistryContractAddress,
            "transferUpkeepAdmin",
            [
                { type: "uint256", value: this.id },
                { type: "address", value: newOwner }
            ],
            "0"
        );
    }

    public async acceptUpkeepAdmin(): Promise<ContractCallAction> {
        return await writeContract(
            this.keeperRegistryContractAddress,
            "acceptUpkeepAdmin",
            [
                { type: "uint256", value: this.id }
            ],
            "0"
        );
    }

    public async withdrawFunds(address: string): Promise<ContractCallAction> {
        return await writeContract(
            this.keeperRegistryContractAddress,
            "withdrawFunds",
            [
                { type: "uint256", value: this.id },
                { type: "address", value: address }
            ],
            "0"
        );
    }
}
