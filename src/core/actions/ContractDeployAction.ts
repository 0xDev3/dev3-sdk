import { MainApi } from '../api/main-api';
import { Contract } from '../contracts/Contract';
import { poll, ensureBrowser } from '../helpers/util';
import {
    ContractDeploymentRequest,
    RequestStatus,
} from '../types';

export class ContractDeployAction {

    private readonly deploymentRequest: ContractDeploymentRequest;

    constructor(deploymentRequest: ContractDeploymentRequest) {
        this.deploymentRequest = deploymentRequest;
    }

    get actionUrl(): string {
        return this.deploymentRequest.redirect_url;
    }

    get status(): RequestStatus {
        return this.deploymentRequest.status;
    }
    
    get transactionHash(): string | undefined {
        return this.deploymentRequest.deploy_tx.tx_hash;
    }

    get transactionCaller(): string | undefined {
        return this.deploymentRequest.deployer_address;
    }

    public present(): Promise<Contract> {
        ensureBrowser();
        let div = document.createElement('div');
        div.setAttribute("style", "position:fixed;top:0;left:0;background:rgba(0,0,0,0.6);z-index:1;width:100%;height:100%;pointer-events:none;display:block;");
        div.innerHTML = `
            <iframe style="width:80%;margin:auto;" src="${this.actionUrl}" scrolling="no" frameborder="0px"></iframe>
        `;
        document.body.appendChild(div);
        return new Promise<Contract>((resolve, reject) => {
            this.awaitResult().then(result => {
                div.remove();
                resolve(result);
            }).catch(err => {
                div.remove();
                reject(err);
            });
        });
    }
    
    public awaitResult(): Promise<Contract> {
        return new Promise((resolve, reject) => {
            poll<ContractDeploymentRequest>(
                () =>
                    MainApi.instance().fetchContractDeploymentRequestById(this.deploymentRequest.id),
                    (response) => response.status === RequestStatus.PENDING
            ).then(result => {
                resolve(new Contract(result));
            }).catch(err => {
                reject(err);
            }) 
        });
    }
}
