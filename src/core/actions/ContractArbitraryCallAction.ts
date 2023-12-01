import * as ExecEnv from '../../execenv/modal';
import { MainApi } from '../api/main-api';
import { poll } from '../helpers/util';
import { ContractArbitraryCallRequest, RequestStatus } from '../types';

export class ContractArbitraryCallAction {
  private readonly callRequest: ContractArbitraryCallRequest;

  constructor(callRequest: ContractArbitraryCallRequest) {
    this.callRequest = callRequest;
  }

  get actionUrl(): string {
    return this.callRequest.redirect_url;
  }

  get status(): RequestStatus {
    return this.callRequest.status;
  }

  get transactionHash(): string | undefined {
    return this.callRequest.arbitrary_call_tx.tx_hash;
  }

  get transactionCaller(): string | undefined {
    return this.callRequest.caller_address;
  }

  public async present(): Promise<ContractArbitraryCallAction> {
    return (await ExecEnv.present(this.actionUrl)) as ContractArbitraryCallAction;
  }

  public awaitResult(): Promise<ContractArbitraryCallAction> {
    return new Promise((resolve, reject) => {
      poll<ContractArbitraryCallRequest>(
        () =>
          MainApi.instance().fetchContractArbitraryCallRequestById(this.callRequest.id),
        (response) => response.status === RequestStatus.PENDING
      )
        .then((result) => {
          resolve(new ContractArbitraryCallAction(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
