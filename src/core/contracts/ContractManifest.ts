import { ContractDeployAction } from '../actions/ContractDeployAction';
import { MainApi } from '../api/main-api';
import { MapperService } from '../services/mapper-service';
import { 
  DeployableContract,
  ScreenConfig
} from '../types';

export class ContractManifest {
  private readonly defaultEthAmount = '0';

  public deployableContract: DeployableContract;

  constructor(deployableContract: DeployableContract) {
    this.deployableContract = deployableContract;
  }

  public async buildDeployment(
    alias: string,
    constructorParams: any[],
    config?: {
      ethAmount?: string;
      arbitraryData?: Map<string, object>;
      screenConfig?: ScreenConfig;
      callerAddress?: string;
      redirectUrl?: string;
    }
  ) {
    const constructorParamsMapped = MapperService.instance().encodeConstructorInputs(
      constructorParams,
      this.deployableContract
    );
    const deploymentRequest = await MainApi.instance().createContractDeploymentRequest(
      {
        alias: alias,
        constructor_params: constructorParamsMapped,
        contract_id: this.deployableContract.id,
        initial_eth_amount: config?.ethAmount ?? this.defaultEthAmount,
        arbitrary_data: config?.arbitraryData,
        redirect_url: config?.redirectUrl,
        deployer_address: config?.callerAddress,
        screen_config: config?.screenConfig
      }
    );
    return new ContractDeployAction(deploymentRequest);
  }

}
