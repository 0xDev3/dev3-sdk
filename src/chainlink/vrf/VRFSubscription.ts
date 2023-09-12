import { ContractCallAction } from "../../core/actions/ContractCallAction";
import { readContract, writeContract } from "../../core/helpers/util";

export class VRFSubscription {
    public id: string = "";
    public balance: string = "";
    public requestCount: string = "";
    public owner: string = "";
    public consumers: string[] = [];
    public coordinatorAddress: string = "";
    public chainlinkTokenContractAddress: string = "";

    constructor() { }

    public async getInfo(subId?: string) {
        const callRequest = await readContract(
            this.coordinatorAddress,
            "getSubscription",
            [{ type: "uint64", value: subId ? subId : this.id }],
            ["uint96", "uint64", "address", "address[]"],
            "0x0"
        );
        this.balance = callRequest.return_values[0];
        this.requestCount = callRequest.return_values[1];
        this.owner = callRequest.return_values[2];
        this.consumers = Array.from(callRequest.return_values[3]);
        return this;
    }

    public async fund(amount: string): Promise<ContractCallAction> {
        return await writeContract(
            this.chainlinkTokenContractAddress,
            "transferAndCall",
            [
                { type: "address", value: this.coordinatorAddress },
                { type: "uint256", value: amount },
                { type: "bytes", value: this.id },
            ],
            "0"
        );
    }

    public async cancel(toAddress: string): Promise<ContractCallAction> {
        return await writeContract(
            this.coordinatorAddress,
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
            this.coordinatorAddress,
            "ownerCancelSubscription",
            [
                { type: "uint64", value: this.id }
            ],
            "0"
        );
    }

    public async addConsumer(consumerAddress: string): Promise<ContractCallAction> {
        return await writeContract(
            this.coordinatorAddress,
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
            this.coordinatorAddress,
            "removeConsumer",
            [
                { type: "uint64", value: this.id },
                { type: "address", value: consumerAddress }
            ],
            "0"
        );
    }

    public async acceptOwnership(): Promise<ContractCallAction> {
        return await writeContract(
            this.coordinatorAddress,
            "acceptSubscriptionOwnership",
            [],
            "0"
        );
    }

    public async acceptSubscriptionOwnerTransfer(): Promise<ContractCallAction> {
        return await writeContract(
            this.coordinatorAddress,
            "acceptSubscriptionOwnerTransfer",
            [
                { type: "uint64", value: this.id }
            ],
            "0"
        );
    }

    public async requestSubscriptionOwnerTransfer(newOwner: string): Promise<ContractCallAction> {
        return await writeContract(
            this.coordinatorAddress,
            "requestSubscriptionOwnerTransfer",
            [
                { type: "uint64", value: this.id },
                { type: "address", value: newOwner }
            ],
            "0"
        );
    }
}
