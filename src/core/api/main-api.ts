import { AxiosResponse } from 'axios';
import {
  AttachTxHashRequest,
  ContractDeploymentRequests,
  CreateFunctionCallRequestWithContractAddress,
  CreateFunctionCallRequestWithContractAlias,
  CreateFunctionCallRequestWithContractId,
  DeployableContract,
  DeployableContractsRequest,
  DeployableContractsResult,
  FunctionCallRequest,
  FunctionCallRequests,
  ReadFromContractByAddressRequest,
  ReadFromContractByAliasRequest,
  ReadFromContractByIdRequest,
  ReadFromContractResult,
} from '../types';
import { HttpClient } from './http-client';

export class MainApi extends HttpClient {
  private static classInstance?: MainApi;

  private constructor(baseURL: string, apiKey: string, projectId: string) {
    super(baseURL, apiKey, projectId);
  }

  public static init(baseURL: string, apiKey: string, projectId: string) {
    if (!this.classInstance) {
      this.classInstance = new MainApi(baseURL, apiKey, projectId);
    }
  }

  public static instance(): MainApi {
    if (this.classInstance === undefined) {
      throw 'FATAL_ERROR: API module not initialized.';
    }
    return this.classInstance;
  }

  public async fetchContractDeploymentRequests(
    contractIds: string[],
    deployedOnly: boolean,
    contracTags: string[],
    contractImplements: string[]
  ): Promise<ContractDeploymentRequests> {
    const result = await this.protectedInstance.get<ContractDeploymentRequests>(
      `deploy/by-project/${this.projectId}`,
      {
        params: {
          contractIds: contractIds.join(','),
          contracTags: contracTags.join(','),
          contractImplements: contractImplements.join(','),
          deployedOnly,
        },
      }
    );
    return result;
  }

  public async createFunctionCallRequest(
    request:
      | CreateFunctionCallRequestWithContractId
      | CreateFunctionCallRequestWithContractAlias
      | CreateFunctionCallRequestWithContractAddress
  ): Promise<FunctionCallRequest> {
    const result = await this.protectedInstance.post<FunctionCallRequest>(
      'function-call',
      request
    );
    return result;
  }

  public async fetchFunctionCallRequestById(
    id: string
  ): Promise<FunctionCallRequest> {
    const result = await this.instance.get<FunctionCallRequest>(
      `function-call/${id}`
    );
    return result;
  }

  public async fetchFunctionCallRequests(
    deployedContractId?: string,
    contractAddress?: string
  ): Promise<FunctionCallRequest[]> {
    const params: Map<string, string> = new Map();
    if (deployedContractId) {
      params.set('deployedContractId', deployedContractId);
    }
    if (contractAddress) {
      params.set('contractAddress', contractAddress);
    }
    const result = await this.instance.get<FunctionCallRequests>(
      `function-call/by-project/${this.projectId}`,
      { params }
    );
    return result.requests;
  }

  public async readContract(
    request:
      | ReadFromContractByAddressRequest
      | ReadFromContractByAliasRequest
      | ReadFromContractByIdRequest
  ): Promise<ReadFromContractResult> {
    const result = await this.protectedInstance.post<ReadFromContractResult>(
      'readonly-function-call',
      request
    );
    return result;
  }

  public async attachTxHashForFunctionCall(
    request: AttachTxHashRequest
  ): Promise<AxiosResponse> {
    const result = await this.instance.put(
      `function-call/${request.action_id}`,
      {
        tx_hash: request.tx_hash,
        caller_address: request.caller_address,
      }
    );
    return result;
  }

  public async fetchDeployableContracts(
    request: DeployableContractsRequest
  ): Promise<DeployableContractsResult> {
    const result = await this.instance.get('deployable-contracts', {
      params: {
        tags: request.tags.join(','),
        implements: request.implements.join(','),
      },
    });
    return result;
  }

  public async fetchDeployableContractById(
    id: string
  ): Promise<DeployableContract> {
    const result = await this.instance.get<DeployableContract>(
      `deployable-contracts/${id}`
    );
    return result;
  }
}
