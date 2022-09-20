import {
  ContractDeploymentRequest,
  RequestStatus,
  ScreenConfig,
} from '../types';
import { ContractCall } from '../actions/ContractCall';
import { DeployableContractsService } from '../services/manifest-service';
import { MainApi } from '../api/main-api';
import { MapperService } from '../services/mapper-service';
import { SDKError } from '../../common/error';

export class Contract {
  protected readonly defaultCaller =
    '0x0000000000000000000000000000000000000000';
  protected readonly defaultEthAmount = '0';

  public deploymentRequest: ContractDeploymentRequest;

  constructor(deploymentRequest: ContractDeploymentRequest) {
    this.deploymentRequest = deploymentRequest;
  }

  public async execute(
    functionName: string,
    functionParams: any[],
    config?: {
      onCreate?: (action: ContractCall) => void;
      onExecute?: (action: ContractCall) => void;
      ethAmount?: string;
      arbitraryData?: Map<string, object>;
      screenConfig?: ScreenConfig;
      callerAddress?: string;
      redirectUrl?: string;
    }
  ): Promise<ContractCall> {
    if (this.deploymentRequest.status !== RequestStatus.SUCCESS) {
      return Promise.reject(
        `Can't call execute on a contract with deployment status: ${this.deploymentRequest.status}`
      );
    }
    const contractCall = new ContractCall({
      onCreate: config?.onCreate,
      onExecute: config?.onExecute,
    });
    const contractManifest =
      await DeployableContractsService.instance().getManifest(
        this.deploymentRequest.contract_id
      );
    const functionParamsMapped = MapperService.instance().encodeInputs(
      functionName,
      functionParams,
      contractManifest
    );
    return contractCall.startFlow({
      deployed_contract_id: this.deploymentRequest.id,
      function_name: functionName,
      function_params: functionParamsMapped,
      eth_amount: config?.ethAmount ?? this.defaultEthAmount,
      arbitrary_data: config?.arbitraryData,
      screen_config: config?.screenConfig,
      caller_address: config?.callerAddress,
      redirect_url: config?.redirectUrl,
    });
  }

  public async read(functionName: string, functionParams: any[]): Promise<any> {
    if (this.deploymentRequest.status !== RequestStatus.SUCCESS) {
      return Promise.reject(
        new SDKError(
          `Can't read state on a contract with deployment status: ${this.deploymentRequest.status}`
        )
      );
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
      caller_address: this.defaultCaller,
    });

    return response;
  }
}
