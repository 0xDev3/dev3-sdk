import { BigNumber } from '@ethersproject/bignumber';

export interface CreateWalletAuthorizationRequest {
  wallet_address?: string;
  redirect_url?: string;
  arbitrary_data?: Map<string, unknown>;
  screen_config?: ScreenConfig;
  message_to_sign?: string;
  store_indefinitely?: boolean;
}

export interface WalletAuthorizationRequests {
  requests: WalletAuthorizationRequest[];
}

export interface WalletAuthorizationRequest {
  id: string;
  project_id: string;
  status: RequestStatus;
  redirect_url: string;
  wallet_address?: string;
  arbitrary_data?: Map<string, unknown>;
  screen_config?: ScreenConfig;
  message_to_sign: string;
  signed_message?: string;
  created_at: Date;
}

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

export interface CreateContractArbitraryCallRequestWithContractId {
  deployed_contract_id: string;
  function_data: string;
  eth_amount: string;
  arbitrary_data?: Map<string, object>;
  screen_config?: ScreenConfig;
  caller_address?: string;
  redirect_url?: string;
}

export interface CreateContractArbitraryCallRequestWithContractAlias {
  deployed_contract_alias: string;
  function_data: string;
  eth_amount: string;
  arbitrary_data?: Map<string, object>;
  screen_config?: ScreenConfig;
  caller_address?: string;
  redirect_url?: string;
}

export interface CreateContractArbitraryCallRequestWithContractAddress {
  contract_address: string;
  function_data: string;
  eth_amount: string;
  arbitrary_data?: Map<string, object>;
  screen_config?: ScreenConfig;
  caller_address?: string;
  redirect_url?: string;
}

export interface ContractArbitraryCallRequest {
  id: string;
  status: RequestStatus;
  deployed_contract_id?: string;
  contract_address: string;
  function_name?: string;
  function_params?: EncodedFunctionParameter[];
  function_call_data: string;
  eth_amount: string;
  chain_id: number;
  redirect_url: string;
  project_id: string;
  created_at: Date;
  arbitrary_data?: Map<string, object>;
  screen_config?: ScreenConfig;
  caller_address?: string;
  arbitrary_call_tx: TxData;
}

export interface ContractArbitraryCallRequests {
  requests: ContractArbitraryCallRequest[];
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

export interface CreateContractDeploymentRequest {
  alias: string;
  contract_id: string;
  constructor_params: EncodedFunctionParameter[];
  deployer_address?: string;
  redirect_url?: string;
  initial_eth_amount: string;
  arbitrary_data?: Map<string, object>;
  screen_config?: ScreenConfig;
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
  arbitrary_data?: Map<string, object>;
  screen_config: ScreenConfig;
  contract_address?: string;
  deployer_address?: string;
  description?: string;
  deploy_tx: TxData;
  imported: boolean;
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

export interface GetPayloadRequest {
  address?: string;
}

export interface GetPayload {
  payload: string;
}

export interface GetJwtRequest {
  address: string;
  signed_payload: string;
  chain_id?: number;
}

export interface GetJwtByMessageRequest {
  address: string;
  message_to_sign: string;
  signed_payload: string;
}

export interface JwtToken {
  access_token: string;
  expires_in: string;
  refresh_token: string;
  refresh_token_expires_in: string;
}

export interface CreateAddressBookEntryRequest {
  alias: string;
  address: string;
  phone_number?: string;
  email?: string;
}

export interface UpdateAddressBookEntryRequest {
  id: string;
  alias: string;
  address: string;
  phone_number?: string;
  email?: string;
}

export interface DeleteAddressBookEntryRequest {
  id: string;
}

export interface FetchAddressBookEntryByAliasRequest {
  alias: string;
}

export interface AddressBookEntry {
  id: string;
  alias: string;
  address: string;
  phone_number?: string;
  email?: string;
  created_at: Date;
}

export interface AddressBookEntries {
  entries: AddressBookEntry[];
}

export enum AssetType {
  NATIVE = 'NATIVE',
  TOKEN = 'TOKEN',
}

export interface CreateAssetSendRequest {
  asset_type: AssetType;
  recipient_address: string;
  amount: string;
  token_address?: string;
  redirect_url?: string;
  sender_address?: string;
  arbitrary_data?: Map<string, object>;
  screen_config?: ScreenConfig;
}

export interface AssetSendRequest {
  id: string;
  project_id: string;
  status: RequestStatus;
  chain_id: number;
  token_address?: string;
  asset_type: AssetType;
  amount: string;
  sender_address?: string;
  recipient_address: string;
  arbitrary_data?: Map<string, object>;
  screen_config?: ScreenConfig;
  redirect_url: string;
  send_tx: TxData;
  created_at: string;
}

export interface AssetSendRequests {
  requests: AssetSendRequest[];
}

export interface ProjectInfoRequest {
  id: string;
  owner_id: string;
  issuer_contract_address: string;
  base_redirect_url: string;
  chain_id: number;
  custom_rpc_url?: string;
  created_at: Date;
}

export interface VRFCoordinatorConfig {
  minimumRequestConfirmations: number;
  maxGasLimit: number;
  stalenessSeconds: number;
  gasAfterPaymentCalculation: number;
}

export interface VRFSubscriptionInfo {
  id: string;
  balance: string;
  requestCount: string;
  owner: string;
  consumers: string[];
}

export interface FunctionsOracleRegistryConfig {
  maxGasLimit: number;
  stalenessSeconds: number;
  gasAfterPaymentCalculation: number;
  fallbackWeiPerUnitLink: number;
  gasOverhead: number;
  linkAddress: string;
  linkPriceFeed: string;
}

export interface FunctionsOracleRegistryRequestConfig {
  maxGasLimit: number;
  authorizedSenders: string[];
}

export interface FunctionSubscriptionInfo {
  id: string;
  balance: string;
  owner: string;
  authorizedConsumers: string[];
}

export interface KeeperRegistrarConfig {
  autoApproveConfigType: number;
  autoApproveMaxAllowed: number;
  approvedCount: number;
  keeperRegistry: string;
  minLINKJuels: number;
}

export interface UpkeepInfo {
  balance: string;
  targetContract: string;
  admin: string;
  checkData: string;
  offchainConfig: string;
  executeGas: string;
  maxValidBlockNumber: string;
  lastPerformBlockNumber: string;
  amountSpent: string;
  paused: boolean;
}
