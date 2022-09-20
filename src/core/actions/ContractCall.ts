import { SDKError } from '../../common/error';
import { MainApi } from '../api/main-api';
import { poll } from '../helpers/util';
import {
  FunctionCallRequest,
  CreateFunctionCallRequestWithContractId,
  CreateFunctionCallRequestWithContractAlias,
  CreateFunctionCallRequestWithContractAddress,
  RequestStatus,
} from '../types';

export interface FunctionCallRequestCallbacks {
  onCreate?: (action: ContractCall) => void;
  onExecute?: (action: ContractCall) => void;
}

export class ContractCall {
  readonly pollIntervalSeconds = 3;

  public functionCallRequest?: FunctionCallRequest;

  public onCreate?: (request: ContractCall) => void;
  public onExecute?: (request: ContractCall) => void;

  constructor(callbacks: FunctionCallRequestCallbacks) {
    this.onCreate = callbacks.onCreate;
    this.onExecute = callbacks.onExecute;
  }

  async startFlow(
    request:
      | CreateFunctionCallRequestWithContractId
      | CreateFunctionCallRequestWithContractAlias
      | CreateFunctionCallRequestWithContractAddress
  ): Promise<ContractCall> {
    if (this.functionCallRequest) {
      throw new SDKError('Function call request already created!');
    }
    return new Promise((resolve, reject) => {
      MainApi.instance()
        .createFunctionCallRequest(request)
        .then((callRequest) => {
          this.functionCallRequest = callRequest;
          this.onCreate?.(this);
          if (this.onExecute) {
            poll<FunctionCallRequest>(
              () =>
                MainApi.instance().fetchFunctionCallRequestById(callRequest.id),
              (response) => response.status === RequestStatus.PENDING,
              this.pollIntervalSeconds
            )
              .then((result) => {
                this.functionCallRequest = result;
                this.onExecute?.(this);
                resolve(this);
              })
              .catch((err) => reject(err));
          } else {
            resolve(this);
          }
        })
        .catch((err) => reject(err));
    });
  }
}
