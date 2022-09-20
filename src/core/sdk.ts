import { SDKError } from '../common/error';
import { MainApi } from './api/main-api';
import { Contract } from './contracts/Contract';
import { ContractManifest } from './contracts/ContractManifest';

export class Dev3SDK {
  private readonly BASE_URL =
    'https://eth-staging.ampnet.io/api/blockchain-api/v1';

  constructor(apiKey: string, projectId: string) {
    MainApi.init(this.BASE_URL, apiKey, projectId);
  }

  async getDeployableContracts(
    contractTags: string[] = [],
    contractImplements: string[] = []
  ): Promise<ContractManifest[]> {
    const result = await MainApi.instance().fetchDeployableContracts({
      tags: contractTags,
      implements: contractImplements,
    });
    return result.deployable_contracts.map((r) => new ContractManifest(r));
  }

  async getContractByAlias(alias: string): Promise<Contract> {
    const result = await this.getDeployedContracts();
    const contract = result.find((c) => c.deploymentRequest.alias === alias);
    if (!contract) {
      return Promise.reject(
        new SDKError(`Contract with alias '${alias}' not found!`)
      );
    }
    return contract;
  }

  async getDeployedContracts(
    ids: string[] = [],
    deployedOnly = true,
    contractTags: string[] = [],
    contractImplements: string[] = []
  ): Promise<Contract[]> {
    const result = await MainApi.instance().fetchContractDeploymentRequests(
      ids,
      deployedOnly,
      contractTags,
      contractImplements
    );
    return result.requests.map((r) => new Contract(r));
  }

  async getDeployableContract(id: string): Promise<ContractManifest> {
    const result = await MainApi.instance().fetchDeployableContractById(id);
    return new ContractManifest(result);
  }
}
