import { MainApi } from '../api/main-api';
import { poll, ensureBrowser } from '../helpers/util';
import {
    FunctionCallRequest,
    RequestStatus,
} from '../types';

export class ContractCallAction {

    private readonly callRequest: FunctionCallRequest;

    constructor(callRequest: FunctionCallRequest) {
        this.callRequest = callRequest;
    }

    get actionUrl(): string {
        return this.callRequest.redirect_url;
    }

    get status(): RequestStatus {
        return this.callRequest.status;
    }
    
    get transactionHash(): string | undefined {
        return this.callRequest.function_call_tx.tx_hash;
    }

    get transactionCaller(): string | undefined {
        return this.callRequest.caller_address;
    }

    public present(): Promise<ContractCallAction> {
        ensureBrowser();
        let div = document.createElement('div');
        div.setAttribute("style", "position:fixed;top:0;left:0;background:rgba(0,0,0,0.6);z-index:1;width:100%;height:100%;display:block;padding-top:32px;");
        div.innerHTML = `
            <iframe style="width:100%;margin:auto;max-width:500px;display:block;border:none;border-radius:16px;height:100%;max-height:700px;" src="${this.actionUrl}" scrolling="no" frameborder="0px"></iframe>
        `;
        document.body.appendChild(div);
        return new Promise<ContractCallAction>((resolve, reject) => {
            this.awaitResult().then(result => {
                div.remove();
                resolve(result);
            }).catch(err => {
                div.remove();
                reject(err);
            });
        });
    }

    public awaitResult(): Promise<ContractCallAction> {
        return new Promise((resolve, reject) => {
            poll<FunctionCallRequest>(
                () =>
                    MainApi.instance().fetchFunctionCallRequestById(this.callRequest.id),
                    (response) => response.status === RequestStatus.PENDING
            ).then(result => {
                resolve(new ContractCallAction(result));
            }).catch(err => {
                reject(err);
            }) 
        });
    }
}
