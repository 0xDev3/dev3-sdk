import { MainApi } from './api/main-api';
import { Rewarder } from './contracts/dev3/rewarder/Rewarder';
import { ContractId } from './types';

export class Dev3SDK {
  private readonly BASE_URL =
    'https://eth-staging.ampnet.io/api/blockchain-api/v1';

  constructor(apiKey: string, projectId: string) {
    MainApi.init(this.BASE_URL, apiKey, projectId);
  }

  public async getRewarderInstances(): Promise<Rewarder[]> {
    const queryResult = await MainApi.instance().getContractDeploymentRequests([
      ContractId.REWARDER,
    ]);
    return queryResult.requests.map((r) => new Rewarder(r));
  }
}
