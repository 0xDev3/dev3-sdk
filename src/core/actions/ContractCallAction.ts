import * as ExecEnv from '../../execenv/modal';
import { MainApi } from '../api/main-api';
import { poll } from '../helpers/util';
import { FunctionCallRequest, RequestStatus } from '../types';

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

  public async present(): Promise<ContractCallAction> {
    return (await ExecEnv.present(this.actionUrl)) as ContractCallAction;
  }

  public awaitResult(): Promise<ContractCallAction> {
    return new Promise((resolve, reject) => {
      poll<FunctionCallRequest>(
        () =>
          MainApi.instance().fetchFunctionCallRequestById(this.callRequest.id),
        (response) => response.status === RequestStatus.PENDING
      )
        .then((result) => {
          resolve(new ContractCallAction(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
