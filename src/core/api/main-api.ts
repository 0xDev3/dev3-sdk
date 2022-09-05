import {
  ContractDeploymentRequests,
  CreateFunctionCallRequestWithContractAddress,
  CreateFunctionCallRequestWithContractAlias,
  CreateFunctionCallRequestWithContractId,
  FunctionCallRequest,
  FunctionCallRequests,
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
      `/deploy/by-project/${this.projectId}`,
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
      `/function-call`,
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
}
