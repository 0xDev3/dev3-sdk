import {
  ContractDeploymentRequest,
  FunctionOutputParam,
  FunctionParam,
  FunctionParameter,
  RequestStatus,
  ScreenConfig,
} from '../types';
import { ContractCall } from '../actions/ContractCall';
import { DeployableContractsService } from '../services/manifest-service';
import { MainApi } from '../api/main-api';

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
    config?: {
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

    const functionParamsMapped = this.mapInputParams(
      functionParams,
      functionDecorator.inputs
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

  public async read(functionName: string, functionParams: any[]): Promise<any> {
    if (this.deploymentRequest.status !== RequestStatus.SUCCESS) {
      throw `Contract:: Can't call execute on a contract with deployment status: ${this.deploymentRequest.status}`;
    }

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

    const outputParams = this.mapOutputParams(functionDecorator.outputs);
    const response = await MainApi.instance().readContract({
      deployed_contract_id: this.deploymentRequest.id,
      function_name: functionName,
      function_params: functionParams,
      output_params: outputParams,
      caller_address: '0x000000000000000000000000000000000000000b',
    });
    return response;
  }

  private mapInputParams(
    functionParams: any[],
    inputs?: FunctionParameter[]
  ): FunctionParam[] {
    if (!inputs) {
      return [];
    }
    return inputs.map((input, index) => {
      switch (input.solidity_type) {
        case 'tuple[]': {
          const listOfObjects: any[] = functionParams[index];
          const listOfObjectsMapped = listOfObjects.map((obj: any[]) => {
            return {
              type: 'struct',
              value: this.mapInputParams(obj, inputs),
            } as FunctionParam;
          });
          return {
            type: 'struct[]',
            value: listOfObjectsMapped,
          } as FunctionParam;
        }
        case 'tuple':
          return {
            type: 'struct',
            value: this.mapInputParams(functionParams[index], input.parameters),
          } as FunctionParam;
        default:
          return this.toJsonArgument(
            input.solidity_type,
            functionParams[index]
          );
      }
    });
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
        value: String(value),
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

  private mapOutputParams(
    outputs?: FunctionParameter[]
  ): FunctionOutputParam[] {
    if (!outputs) {
      return [];
    }
    return outputs.map((o) => {
      if (o.solidity_type === 'tuple[]') {
        return {
          type: 'struct[]',
          elems: this.mapOutputParams(o.parameters),
        };
      } else if (o.solidity_type === 'tuple') {
        return {
          type: 'struct',
          elems: this.mapOutputParams(o.parameters),
        };
      } else {
        return o.solidity_type;
      }
    });
  }
}
