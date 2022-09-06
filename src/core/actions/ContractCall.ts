import { MainApi } from '../api/main-api';
import { poll } from '../helpers/util';
import {
  FunctionCallRequest,
  CreateFunctionCallRequestWithContractId,
  CreateFunctionCallRequestWithContractAlias,
  CreateFunctionCallRequestWithContractAddress,
  RequestStatus,
} from '../types';

export class ContractCall {
  public functionCallRequest?: FunctionCallRequest;

  public onCreate?: (request: ContractCall) => void;
  public onExecute?: (request: ContractCall) => void;

  constructor(
    onCreate?: (request: ContractCall) => void,
    onExecute?: (request: ContractCall) => void
  ) {
    this.onCreate = onCreate;
    this.onExecute = onExecute;
  }

  async startFlow(
    request:
      | CreateFunctionCallRequestWithContractId
      | CreateFunctionCallRequestWithContractAlias
      | CreateFunctionCallRequestWithContractAddress
  ) {
    if (this.functionCallRequest) {
      throw 'err';
    }
    const callRequest = await MainApi.instance().createFunctionCallRequest(
      request
    );
    this.functionCallRequest = callRequest;
    this.onCreate?.(this);
    if (this.onExecute) {
      poll<FunctionCallRequest>(
        async () => {
          return MainApi.instance().fetchFunctionCallRequestById(
            callRequest.id
          );
        },
        (response) => {
          return response.status === RequestStatus.PENDING;
        },
        3
      ).then((result) => {
        this.functionCallRequest = result;
        this.onExecute?.(this);
      });
    }
  }
}
