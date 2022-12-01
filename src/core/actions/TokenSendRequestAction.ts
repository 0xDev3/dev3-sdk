import { MainApi } from '../api/main-api';
import { poll, ensureBrowser } from '../helpers/util';
import {
    AssetSendRequest,
    RequestStatus,
} from '../types';

export class TokenSendRequestAction {

    private readonly sendRequest: AssetSendRequest;

    constructor(sendRequest: AssetSendRequest) {
        this.sendRequest = sendRequest;
    }

    get actionUrl(): string {
        return this.sendRequest.redirect_url;
    }

    get status(): RequestStatus {
        return this.sendRequest.status;
    }

    get token(): string {
        return this.sendRequest.token_address!!;
    }

    get amount(): string {
        return this.sendRequest.amount;
    }

    get sender(): string | undefined {
        return this.sendRequest.sender_address;
    }

    get receiver(): string | undefined {
        return this.sendRequest.recipient_address;
    }
    
    get transactionHash(): string | undefined {
        return this.sendRequest.send_tx.tx_hash;
    }

    public present(): Promise<TokenSendRequestAction> {
        ensureBrowser();
        let div = document.createElement('div');
        div.setAttribute("style", "position:fixed;top:0;left:0;background:rgba(0,0,0,0.6);z-index:1;width:100%;height:100%;pointer-events:none;display:block;");
        div.innerHTML = `
            <iframe style="width:80%;margin:auto;" src="${this.actionUrl}" scrolling="no" frameborder="0px"></iframe>
        `;
        document.body.appendChild(div);
        return new Promise<TokenSendRequestAction>((resolve, reject) => {
            this.awaitResult().then(result => {
                div.remove();
                resolve(result);
            }).catch(err => {
                div.remove();
                reject(err);
            });
        });
    }

    public awaitResult(): Promise<TokenSendRequestAction> {
        return new Promise((resolve, reject) => {
            poll<AssetSendRequest>(
                () =>
                    MainApi.instance().fetchAssetSendRequest(this.sendRequest.id),
                    (response) => response.status === RequestStatus.PENDING
            ).then(result => {
                resolve(new TokenSendRequestAction(result));
            }).catch(err => {
                reject(err);
            }) 
        });
    }
}
