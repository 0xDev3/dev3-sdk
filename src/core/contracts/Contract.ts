import { ContractDeploymentRequest } from '../types';

export class Contract {
  public deploymentRequest: ContractDeploymentRequest;

  constructor(deploymentRequest: ContractDeploymentRequest) {
    this.deploymentRequest = deploymentRequest;
  }

}
