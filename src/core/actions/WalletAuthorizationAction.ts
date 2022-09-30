import { WalletAuthorizationRequest, RequestStatus } from "../types";
import { poll } from "../helpers/util";
import { MainApi } from "../api/main-api";

export class WalletAuthorizationAction {

    private readonly authorizationRequest: WalletAuthorizationRequest;

    constructor(authorizationRequest: WalletAuthorizationRequest) {
        this.authorizationRequest = authorizationRequest;
    }

    get actionUrl(): string {
        return this.authorizationRequest.redirect_url;
    }

    get status(): RequestStatus {
        return this.authorizationRequest.status;
    }
    
    get wallet(): string | undefined {
        return this.authorizationRequest.wallet_address;
    }    

    public async awaitResult(): Promise<WalletAuthorizationAction> {
        return new Promise((resolve, reject) => {
            poll<WalletAuthorizationRequest>(
                () =>
                    MainApi.instance().fetchWalletAuthorizationRequestById(this.authorizationRequest.id),
                    (response) => response.status === RequestStatus.PENDING,
            ).then(result => {
                resolve(new WalletAuthorizationAction(result));
            }).catch(err => {
                reject(err);
            }) 
        });
    }
}
