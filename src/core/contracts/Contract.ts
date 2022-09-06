import {
  ContractDeploymentRequest,
  FunctionParam,
  RequestStatus,
  ScreenConfig,
} from '../types';
import { ContractCall } from '../actions/ContractCall';
import { DeployableContractsService } from '../services/manifest-service';

export class Contract {
  public deploymentRequest: ContractDeploymentRequest;

  constructor(deploymentRequest: ContractDeploymentRequest) {
    this.deploymentRequest = deploymentRequest;
  }

  public async execute(
    functionName: string,
    functionParams: any[],
    onCreate: (action: ContractCall) => void,
    onExecuted: (action: ContractCall) => void,
    config: {
      arbitraryData?: Map<string, object>;
      screenConfig?: ScreenConfig;
      callerAddress?: string;
      redirectUrl?: string;
    }
  ): Promise<ContractCall> {
    if (this.deploymentRequest.status !== RequestStatus.SUCCESS) {
      throw `Contract:: Can't call execute on a contract with deployment status: ${this.deploymentRequest.status}`;
    }

    const contractCall = new ContractCall(onCreate, onExecuted);
    const contractManifest =
      await DeployableContractsService.instance().getManifest(
        this.deploymentRequest.contract_id
      );
    const functionDecorator = contractManifest.functions.find(
      (decorator) => decorator.solidity_name === functionName
    );

    if (!functionDecorator) {
      throw `Contract:: Can't call execute on a contract. Function ${functionName} not found in contract descriptor.`;
    }

    const functionParamsMapped = functionDecorator.inputs.map(
      (input, index) => {
        return this.toJsonArgument(input.solidity_type, functionParams[index]);
      }
    );

    contractCall.startFlow({
      deployed_contract_id: this.deploymentRequest.id,
      function_name: functionName,
      function_params: functionParamsMapped,
      eth_amount: '0',
      arbitrary_data: config?.arbitraryData,
      screen_config: config?.screenConfig,
      caller_address: config?.callerAddress,
      redirect_url: config?.redirectUrl,
    });
    return contractCall;
  }

  private toJsonArgument(solidityType: string, value: any): FunctionParam {
    if (
      solidityType.startsWith('uint') ||
      solidityType.startsWith('int') ||
      solidityType === 'byte' ||
      solidityType === 'string' ||
      solidityType === 'address'
    ) {
      return {
        type: 'string',
        value: value as string,
      };
    } else if (solidityType.startsWith('bytes')) {
      return {
        type: 'string[]',
        value: (value as any[]).map((item) => item as string),
      };
    } else if (solidityType === 'bool') {
      return {
        type: 'boolean',
        value: value as boolean,
      };
    }
    throw `Contract:: Error while converting solidity type ${solidityType} for given value ${value}`;
  }
}
