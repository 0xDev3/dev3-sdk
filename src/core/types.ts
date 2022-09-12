import BigNumber from 'bignumber.js';

export interface CreateFunctionCallRequestWithContractId {
  deployed_contract_id: string;
  function_name: string;
  function_params: EncodedFunctionParameter[];
  eth_amount: string;
  arbitrary_data?: Map<string, object>;
  screen_config?: ScreenConfig;
  caller_address?: string;
  redirect_url?: string;
}

export interface CreateFunctionCallRequestWithContractAlias {
  deployed_contract_alias: string;
  function_name: string;
  function_params: EncodedFunctionParameter[];
  eth_amount: string;
  arbitrary_data?: Map<string, object>;
  screen_config?: ScreenConfig;
  caller_address?: string;
  redirect_url?: string;
}

export interface CreateFunctionCallRequestWithContractAddress {
  contract_address: string;
  function_name: string;
  function_params: EncodedFunctionParameter[];
  eth_amount: string;
  arbitrary_data?: Map<string, object>;
  screen_config?: ScreenConfig;
  caller_address?: string;
  redirect_url?: string;
}

export interface EncodedFunctionParameter {
  type: string;
  value: string | string[] | boolean | EncodedFunctionParameter[];
}

export type EncodedFunctionParameterValue =
  | boolean
  | BigNumber
  | string
  | EncodedFunctionParameter[]
  | EncodedFunctionParameterValue[];

export type EncodedFunctionOutput =
  | string
  | {
      type: string;
      elems: EncodedFunctionOutput[];
    };

export interface ScreenConfig {
  before_action_message?: string;
  after_action_message?: string;
}

export interface TxData {
  tx_hash?: string;
  from?: string;
  to: string;
  data?: string;
  value: string;
  block_confirmations?: number;
  timestamp?: Date;
}

export enum RequestStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILURE = 'FAILURE',
}

export interface ContractDeploymentRequest {
  id: string;
  alias: string;
  status: RequestStatus;
  contract_id: string;
  contract_deployment_data: string;
  constructor_params: EncodedFunctionParameter[];
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
  deploy_tx: TxData;
}

export interface ContractDeploymentRequests {
  requests: ContractDeploymentRequest[];
}

export interface FunctionCallRequest {
  id: string;
  status: RequestStatus;
  deployed_contract_id?: string;
  contract_address: string;
  function_name: string;
  function_params: EncodedFunctionParameter[];
  function_call_data: string;
  eth_amount: string;
  chain_id: number;
  redirect_url: string;
  project_id: string;
  created_at: Date;
  arbitrary_data?: Map<string, object>;
  screen_config?: ScreenConfig;
  caller_address?: string;
  function_call_tx: TxData;
}

export interface FunctionCallRequests {
  requests: FunctionCallRequest[];
}

export interface ReadFromContractByAddressRequest {
  contract_address: string;
  block_number?: string;
  function_name: string;
  function_params: EncodedFunctionParameter[];
  output_params: EncodedFunctionOutput[];
  caller_address: string;
}

export interface ReadFromContractByIdRequest {
  deployed_contract_id: string;
  block_number?: string;
  function_name: string;
  function_params: EncodedFunctionParameter[];
  output_params: EncodedFunctionOutput[];
  caller_address: string;
}

export interface ReadFromContractByAliasRequest {
  deployed_contract_alias: string;
  block_number?: string;
  function_name: string;
  function_params: EncodedFunctionParameter[];
  output_params: EncodedFunctionOutput[];
  caller_address: string;
}

export interface ReadFromContractResult {
  deployed_contract_id?: string;
  contract_address: string;
  block_number: string;
  timestamp: Date;
  return_values: string[];
}

export interface AttachTxHashRequest {
  action_id: string;
  tx_hash: string;
  caller_address: string;
}

export interface DeployableContractsRequest {
  tags: string[];
  implements: string[];
}

export interface FunctionParameter {
  name: string;
  description: string;
  solidity_name: string;
  solidity_type: string;
  recommended_types: string[];
  parameters?: FunctionParameter[];
}

export interface ContractConstructor {
  inputs: FunctionParameter[];
  description: string;
  payable: boolean;
}

export interface ContractFunction {
  name: string;
  description: string;
  solidity_name: string;
  inputs: FunctionParameter[];
  outputs: FunctionParameter[];
  emittable_events: string[];
  read_only: boolean;
}

export interface ContractEvent {
  name: string;
  description: string;
  solidity_name: string;
  inputs: FunctionParameter[];
}

export interface DeployableContract {
  id: string;
  name?: string;
  description?: string;
  binary: string;
  tags: string[];
  implements: string[];
  constructors: ContractConstructor[];
  functions: ContractFunction[];
  events: ContractEvent[];
}

export interface DeployableContractsResult {
  deployable_contracts: DeployableContract[];
}
