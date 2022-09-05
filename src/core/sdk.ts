import { MainApi } from './api/main-api';
import { Contract } from './contracts/Contract';

export class Dev3SDK {
  private readonly BASE_URL =
    'https://eth-staging.ampnet.io/api/blockchain-api/v1';

  constructor(apiKey: string, projectId: string) {
    MainApi.init(this.BASE_URL, apiKey, projectId);
  }

  async getInstances(
    ids: string[],
    deployedOnly = true,
    contractTags: string[] = [],
    contractImplements: string[] = []
  ): Promise<Contract[]> {
    const queryResult = await MainApi.instance().getContractDeploymentRequests(
      ids,
      deployedOnly,
      contractTags,
      contractImplements
    );
    return queryResult.requests.map((r) => new Contract(r));
  }
}
