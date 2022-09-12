import {
  ContractDeploymentRequest,
  RequestStatus,
  ScreenConfig,
} from '../types';
import { ContractCall } from '../actions/ContractCall';
import { DeployableContractsService } from '../services/manifest-service';
import { MainApi } from '../api/main-api';
import { MapperService } from '../services/mapper-service';

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
    const functionParamsMapped = MapperService.instance().encodeInputs(
      functionName,
      functionParams,
      contractManifest
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

    const inputParamsEncoded = MapperService.instance().encodeInputs(
      functionName,
      functionParams,
      contractManifest
    );
    const outputTypesEncoded = MapperService.instance().encodeOutputTypes(
      functionName,
      contractManifest
    );
    const response = await MainApi.instance().readContract({
      deployed_contract_id: this.deploymentRequest.id,
      function_name: functionName,
      function_params: inputParamsEncoded,
      output_params: outputTypesEncoded,
      caller_address: '0x0000000000000000000000000000000000000000',
    });
    return response;
  }
}
