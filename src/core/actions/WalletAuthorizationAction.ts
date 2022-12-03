import { WalletAuthorizationRequest, RequestStatus } from "../types";
import { poll, ensureBrowser } from "../helpers/util";
import { MainApi } from "../api/main-api";
import { User } from "../identity/User";
import { SDKError } from "../../common/error";

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

    public present(): Promise<User> {
        ensureBrowser();
        let div = document.createElement('div');
        div.setAttribute("style", "position:fixed;top:0;left:0;background:rgba(0,0,0,0.6);z-index:1;width:100%;height:100%;display:block;padding-top:32px;");
        div.innerHTML = `
            <iframe style="width:100%;margin:auto;max-width:500px;display:block;border:none;border-radius:16px;height:100%;max-height:700px;" src="${this.actionUrl}" scrolling="no" frameborder="0px"></iframe>
        `;
        document.body.appendChild(div);
        return new Promise<User>((resolve, reject) => {
            this.awaitResult().then(result => {
                div.remove();
                resolve(result);
            }).catch(err => {
                div.remove();
                reject(err);
            });
        });
    }

    public async awaitResult(): Promise<User> {
        return new Promise((resolve, reject) => {
            poll<WalletAuthorizationRequest>(
                () =>
                    MainApi.instance().fetchWalletAuthorizationRequestById(this.authorizationRequest.id),
                    (response) => response.status === RequestStatus.PENDING,
            ).then(result => {
                if (!result.signed_message || 
                    !result.wallet_address ||
                    result.status !== RequestStatus.SUCCESS
                ) { reject(new SDKError(`Failed to authorize.`)); }
                MainApi.instance().getJwtByMessage({
                    message_to_sign: result.message_to_sign,
                    signed_payload: result.signed_message!!,
                    address: result.wallet_address!
                }).then(jwt => {
                    resolve(new User(result.wallet_address!, jwt));
                }).catch(err => {
                    reject(err)
                });
            }).catch(err => {
                reject(err);
            });
        });
    }
}
