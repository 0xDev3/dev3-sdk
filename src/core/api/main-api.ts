import { ContractDeploymentRequests, ContractId } from '../types';
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

  public async getContractDeploymentRequests(
    contractIds: [ContractId]
  ): Promise<ContractDeploymentRequests> {
    const queryResult =
      await this.protectedInstance.get<ContractDeploymentRequests>(
        `/deploy/by-project/${this.projectId}`,
        {
          params: {
            contractIds: contractIds.join(','),
          },
        }
      );
    return queryResult;
  }
}
