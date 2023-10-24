import { Upkeep } from "./Upkeep";
import { readContract, writeContract, fetchChainlinkContractsAddresses, getWeb3Provider, signAndSendTransaction, poll } from '../../core/helpers/util';
import { MainApi } from '../../core/api/main-api';
import { EncodedFunctionParameter, KeeperRegistrarConfig } from '../../core/types';
import { ethers, TransactionReceipt } from 'ethers';

let chainlinkContractsAddresses: any;

export class KeeperRegistry {

    public address: string = "";
    public keeperRegistrarContractAddress: string = "";
    public chainlinkTokenContractAddress: string = "";
    public web3provider: any;
    public projectChainId: string = "";

    constructor() { }

    public async init() {
        this.projectChainId = (await MainApi.instance().fetchProject()).chain_id.toString();
        chainlinkContractsAddresses = await fetchChainlinkContractsAddresses();
        this.address = chainlinkContractsAddresses.get(this.projectChainId).keeper_registry_contract;
        this.keeperRegistrarContractAddress = chainlinkContractsAddresses.get(this.projectChainId).keeper_registrar_contract;
        this.chainlinkTokenContractAddress = chainlinkContractsAddresses.get(this.projectChainId).link_token_contract;
        this.web3provider = await getWeb3Provider(this.projectChainId);
    }

    public async createUpkeep(
        name: string,
        contractAddress: string,
        gasLimit: string,
        adminAddress: string,
        amount: string,
        options?: { pk?: string }
    ): Promise<Upkeep> {
        let transactionHash: string = "";
        const amountInWei = ethers.parseEther(amount).toString();
        const functionParameters = [
            { type: "address", value: this.keeperRegistrarContractAddress },
            { type: "uint256", value: amountInWei },
        ]
        const functionParameters2 = [{
            type: "tuple",
            value: [
                { type: "string", value: name },
                { type: "bytes", value: [] },
                { type: "address", value: contractAddress },
                { type: "uint32", value: gasLimit },
                { type: "address", value: adminAddress },
                { type: "bytes", value: [] },
                { type: "bytes", value: [] },
                { type: "uint96", value: amountInWei },
            ]
        }]
        if (options?.pk) {
            const parameterNames = ["spender", "addedValue"];
            await signAndSendTransaction(
                this.chainlinkTokenContractAddress,
                "increaseAllowance",
                options.pk,
                parameterNames,
                functionParameters as [EncodedFunctionParameter]
            );
            const parameterNames2 = [
                "name",
                "encryptedEmail",
                "upkeepContract",
                "gasLimit",
                "adminAddress",
                "checkData",
                "offchainConfig",
                "amount"
            ];

            await signAndSendTransaction(
                this.keeperRegistrarContractAddress,
                "registerUpkeep",
                options.pk,
                parameterNames2,
                functionParameters2 as [EncodedFunctionParameter],
            );
        } else {
            const registrarAllowance = await writeContract(
                this.chainlinkTokenContractAddress,
                "increaseAllowance",
                functionParameters,
                "0"
            );
            await registrarAllowance.present();
            const upkeep = await writeContract(
                this.keeperRegistrarContractAddress,
                "registerUpkeep",
                functionParameters2,
                "0"
            );
            const result = await upkeep.present();
            transactionHash = result.transactionHash as string;
        }
        const transactionReceipt = await poll<TransactionReceipt>(
            () => this.web3provider.getTransactionReceipt(transactionHash),
            (response) => response == null
        );
        const upkeepId = parseInt(transactionReceipt.logs[3].topics[1]);
        return await this.getUpkeep(upkeepId.toString());
    }

    public async getUpkeep(subId: string): Promise<Upkeep> {
        return Upkeep.fromUpkeepId(subId);
    }

    public async getRegistrationConfig(): Promise<KeeperRegistrarConfig> {
        const callRequest = await readContract(
            this.keeperRegistrarContractAddress,
            "getRegistrationConfig",
            [],
            ["uint8", "uint32", "uint32", "address", "uint256"],
            "0x0"
        );
        return {
            autoApproveConfigType: Number(callRequest.return_values[0]),
            autoApproveMaxAllowed: Number(callRequest.return_values[1]),
            approvedCount: Number(callRequest.return_values[2]),
            keeperRegistry: callRequest.return_values[3],
            minLINKJuels: Number(callRequest.return_values[4])
        }
    }
}
