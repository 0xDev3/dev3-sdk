import { writeContract } from "../core/helpers/util";


export class VRFSubscription {
    public id: string = "";
    public balance: string = "";
    public requestCount: string = "";
    public owner: string = "";
    public consumers: string[] = [];
    public coordinatorAddress: string = "";
    public chainlinkTokenContractAddress: string = "";

    constructor() { }

    public async fund(amount: string) {
        await writeContract(
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

    public async cancel(toAddress: string) {
        await writeContract(
            this.coordinatorAddress,
            "cancelSubscription",
            [
                { type: "uint64", value: this.id },
                { type: "address", value: toAddress }
            ],
            "0"
        );
    }

    public async ownerCancel() {
        await writeContract(
            this.coordinatorAddress,
            "ownerCancelSubscription",
            [
                { type: "uint64", value: this.id }
            ],
            "0"
        );
    }

    public async addConsumer(consumerAddress: string) {
        await writeContract(
            this.coordinatorAddress,
            "addConsumer",
            [
                { type: "uint64", value: this.id },
                { type: "address", value: consumerAddress }
            ],
            "0"
        );
    }

    public async removeConsumer(consumerAddress: string) {
        await writeContract(
            this.coordinatorAddress,
            "removeConsumer",
            [
                { type: "uint64", value: this.id },
                { type: "address", value: consumerAddress }
            ],
            "0"
        );
    }

    public async acceptOwnership() {
        await writeContract(
            this.coordinatorAddress,
            "acceptSubscriptionOwnership",
            [],
            "0"
        );
    }

    public async acceptSubscriptionOwnerTransfer() {
        await writeContract(
            this.coordinatorAddress,
            "acceptSubscriptionOwnerTransfer",
            [
                { type: "uint64", value: this.id }
            ],
            "0"
        );
    }

    public async requestSubscriptionOwnerTransfer(newOwner: string) {
        await writeContract(
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