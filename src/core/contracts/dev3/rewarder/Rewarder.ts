import { ContractDeploymentRequest } from '../../../types';

export class Rewarder {
  public deploymentRequest: ContractDeploymentRequest;

  constructor(deploymentRequest: ContractDeploymentRequest) {
    this.deploymentRequest = deploymentRequest;
  }
}
