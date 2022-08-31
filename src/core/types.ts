export enum ContractId {
  ERC20_FIXED_SUPPLY = 'openzeppelin.erc20presetfixedsupply',
  ERC20_MINTABLE_BURNABLE = 'openzeppelin.erc20presetmintableburnable',
  ERC721_MINTER_PAUSER = 'openzeppelin.erc20presetmintableburnable',
  CROWDFUNDING_VESTING = 'dev3.cfmanager-softcap-vesting',
  CROWDFUNDING_SIMPLE = 'dev3.cfmanager-softcap',
  PAYMENT_SPLITTER = 'dev3.paymentsplitter',
  PAYROLL_HANDLER = 'dev3.payrollhandler',
  REWARDER = 'dev3.rewarder',
  TIME_LOCK = 'dev3.timelock',
  VESTING_WALLET = 'dev3.vestingwallet',
}

export interface ScreenConfig {
  before_action_message: string;
  after_action_message: string;
}

export interface DeployTx {
  tx_hash?: string;
  from: string;
  to: string;
  data: string;
  value: string;
  block_confirmations?: string;
  timestamp?: Date;
}

export interface ConstructorParam {
  type: string;
  value: string;
}

export enum DeploymentRequestStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILURE = 'FAILURE',
}

export interface ContractDeploymentRequest {
  id: string;
  alias: string;
  status: DeploymentRequestStatus;
  contract_id: ContractId;
  contract_deployment_data: string;
  constructor_params: ConstructorParam[];
  contract_tags: string[];
  contract_implements: string[];
  initial_eth_amount: string;
  chain_id: number;
  redirect_url: string;
  project_id: string;
  created_at: Date;
  arbitrary_data: Map<string, object>;
  screen_config: ScreenConfig;
  contract_address?: string;
  deployer_address?: string;
  deploy_tx: DeployTx;
}

export interface ContractDeploymentRequests {
  requests: ContractDeploymentRequest[];
}
