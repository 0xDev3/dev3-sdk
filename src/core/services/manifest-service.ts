import { SDKError } from '../../common/error';
import { MainApi } from '../api/main-api';
import { DeployableContract } from '../types';

export class DeployableContractsService {
  private static classInstance?: DeployableContractsService;

  private deployableContracts = new Map<string, DeployableContract>();

  public static instance(): DeployableContractsService {
    if (!this.classInstance) {
      this.classInstance = new DeployableContractsService();
    }
    return this.classInstance;
  }

  public async getManifest(contractId: string): Promise<DeployableContract> {
    await this.lazyInit();
    const deployableContract = this.deployableContracts.get(contractId);
    if (!deployableContract) {
      throw new SDKError(
        `DeployableContractsService:: Fatal error. No contract found with id ${contractId}`
      );
    }
    return deployableContract;
  }

  private async lazyInit() {
    if (this.deployableContracts.size === 0) {
      const deployableContractsResponse =
        await MainApi.instance().fetchDeployableContracts({
          tags: [],
          implements: [],
        });
      this.deployableContracts =
        deployableContractsResponse.deployable_contracts.reduce((map, item) => {
          map.set(item.id, item);
          return map;
        }, this.deployableContracts);
    }
  }
}
