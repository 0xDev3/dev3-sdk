import { DeployableContract } from '../types';

export class ContractManifest {
  public deployableContract: DeployableContract;

  constructor(deployableContract: DeployableContract) {
    this.deployableContract = deployableContract;
  }
}
