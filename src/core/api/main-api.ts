import { AxiosResponse } from 'axios';
import { SDKError } from '../../common/error';
import {
  AddressBookEntries,
  AddressBookEntry,
  AssetSendRequest,
  AssetSendRequests,
  AttachTxHashRequest,
  ContractDeploymentRequest,
  ContractDeploymentRequests,
  CreateAddressBookEntryRequest,
  CreateAssetSendRequest,
  CreateContractDeploymentRequest,
  CreateFunctionCallRequestWithContractAddress,
  CreateFunctionCallRequestWithContractAlias,
  CreateFunctionCallRequestWithContractId,
  CreateWalletAuthorizationRequest,
  DeleteAddressBookEntryRequest,
  DeployableContract,
  DeployableContractsRequest,
  DeployableContractsResult,
  FetchAddressBookEntryByAliasRequest,
  FunctionCallRequest,
  FunctionCallRequests,
  GetJwtByMessageRequest,
  GetJwtRequest,
  GetPayload,
  GetPayloadRequest,
  JwtToken,
  ReadFromContractByAddressRequest,
  ReadFromContractByAliasRequest,
  ReadFromContractByIdRequest,
  ReadFromContractResult,
  UpdateAddressBookEntryRequest,
  WalletAuthorizationRequest,
  WalletAuthorizationRequests,
} from '../types';
import { HttpClient } from './http-client';

export class MainApi extends HttpClient {
  private static classInstance?: MainApi;

  private constructor(baseURL: string, identityBaseURL: string, apiKey: string, projectId: string) {
    super(baseURL, identityBaseURL, apiKey, projectId);
  }

  public static init(baseURL: string, identityBaseURL: string, apiKey: string, projectId: string) {
    if (!this.classInstance) {
      this.classInstance = new MainApi(baseURL, identityBaseURL, apiKey, projectId);
    }
  }

  public static instance(): MainApi {
    if (this.classInstance === undefined) {
      throw new SDKError('API module not initialized.');
    }
    return this.classInstance;
  }

  public async createWalletAuthorizationRequest(
    request: CreateWalletAuthorizationRequest
  ): Promise<WalletAuthorizationRequest> {
    const result = await this.protectedInstance.post<WalletAuthorizationRequest>(
      'wallet-authorization',
      request
    );
    return result;
  }

  public async fetchWalletAuthorizationRequestById(
    id: string
  ): Promise<WalletAuthorizationRequest> {
    const result = await this.instance.get<WalletAuthorizationRequest>(
      `wallet-authorization/${id}` 
    );
    return result;
  }

  public async fetchWalletAuthorizationRequests(): Promise<WalletAuthorizationRequests> {
    const result = await this.instance.get<WalletAuthorizationRequests>(
      `wallet-authorization/by-project/${this.projectId}`
    );
    return result;
  }

  public async createContractDeploymentRequest(
    request: CreateContractDeploymentRequest
  ): Promise<ContractDeploymentRequest> {
    const result = await this.protectedInstance.post<ContractDeploymentRequest>(
      'deploy',
      request
    );
    return result;
  }

  public async fetchContractDeploymentRequestById(
    id: string
  ): Promise<ContractDeploymentRequest> {
    const result = await this.instance.get<ContractDeploymentRequest>(
      `deploy/${id}`
    );
    return result;
  }

  public async fetchContractDeploymentRequestByAlias(
    alias: string
  ): Promise<ContractDeploymentRequest> {
    const result = await this.instance.get<ContractDeploymentRequest>(
      `deploy/by-project/${this.projectId}/by-alias/${alias}`
    );
    return result;
  }

  public async fetchContractDeploymentRequests(
    contractIds: string[],
    deployedOnly: boolean,
    contracTags: string[],
    contractImplements: string[]
  ): Promise<ContractDeploymentRequests> {
    const result = await this.protectedInstance.get<ContractDeploymentRequests>(
      `deploy/by-project/${this.projectId}`,
      {
        params: {
          contractIds: contractIds.join(','),
          contracTags: contracTags.join(','),
          contractImplements: contractImplements.join(','),
          deployedOnly,
        },
      }
    );
    return result;
  }

  public async deleteContractDeploymentRequestById(id: string): Promise<void> {
    return this.protectedInstance.delete<AxiosResponse>(
      `deploy/${id}`
    );
  }

  public async createFunctionCallRequest(
    request:
      | CreateFunctionCallRequestWithContractId
      | CreateFunctionCallRequestWithContractAlias
      | CreateFunctionCallRequestWithContractAddress
  ): Promise<FunctionCallRequest> {
    const result = await this.protectedInstance.post<FunctionCallRequest>(
      'function-call',
      request
    );
    return result;
  }

  public async fetchFunctionCallRequestById(
    id: string
  ): Promise<FunctionCallRequest> {
    const result = await this.instance.get<FunctionCallRequest>(
      `function-call/${id}`
    );
    return result;
  }

  public async fetchFunctionCallRequests(
    deployedContractId?: string,
    contractAddress?: string
  ): Promise<FunctionCallRequest[]> {
    const params: Map<string, string> = new Map();
    if (deployedContractId) {
      params.set('deployedContractId', deployedContractId);
    }
    if (contractAddress) {
      params.set('contractAddress', contractAddress);
    }
    const result = await this.instance.get<FunctionCallRequests>(
      `function-call/by-project/${this.projectId}`,
      { params }
    );
    return result.requests;
  }

  public async readContract(
    request:
      | ReadFromContractByAddressRequest
      | ReadFromContractByAliasRequest
      | ReadFromContractByIdRequest
  ): Promise<ReadFromContractResult> {
    const result = await this.protectedInstance.post<ReadFromContractResult>(
      'readonly-function-call',
      request
    );
    return result;
  }

  public async attachTxHashForFunctionCall(
    request: AttachTxHashRequest
  ): Promise<AxiosResponse> {
    const result = await this.instance.put(
      `function-call/${request.action_id}`,
      {
        tx_hash: request.tx_hash,
        caller_address: request.caller_address,
      }
    );
    return result;
  }

  public async fetchDeployableContracts(
    request: DeployableContractsRequest
  ): Promise<DeployableContractsResult> {
    const result = await this.instance.get('deployable-contracts', {
      params: {
        tags: request.tags.join(','),
        implements: request.implements.join(','),
      },
    });
    return result;
  }

  public async fetchDeployableContractById(
    id: string
  ): Promise<DeployableContract> {
    const result = await this.instance.get<DeployableContract>(
      `deployable-contracts/${id}`
    );
    return result;
  }

  public async getPayload(
    request?: GetPayloadRequest
  ): Promise<GetPayload> {
    const wallet = request?.address;
    if (wallet) {
      return this.identityServiceInstance.post<GetPayload>(
        'authorize',
        {
          address: wallet
        }
      );
    } else {
      return this.identityServiceInstance.post<GetPayload>(
        'authorize/by-message'
      );
    }
  }

  public async getJwt(
    request: GetJwtRequest
  ): Promise<JwtToken> {
    return this.identityServiceInstance.post<JwtToken>(
      'authorize/jwt',
      request
    );
  }

  public async getJwtByMessage(
    request: GetJwtByMessageRequest
  ): Promise<JwtToken> {
    return this.identityServiceInstance.post<JwtToken>(
      'authorize/jwt/by-message',
      request
    );
  }

  public async createAddressBookEntry(
    request: CreateAddressBookEntryRequest,
    jwt: JwtToken
  ): Promise<AddressBookEntry> {
    return this.instance.post<AddressBookEntry>(
      'address-book',
      request,
      {
        headers: {
          'Authorization': `Bearer ${jwt.access_token}`
        }
      }
    );
  }

  public async updateAddressBookEntry(
    request: UpdateAddressBookEntryRequest,
    jwt: JwtToken
  ): Promise<AddressBookEntry> {
    return this.instance.patch<AddressBookEntry>(
      `address-book/${request.id}`,
      {
        alias: request.alias,
        address: request.address,
        phone_number: request.phone_number,
        email: request.email
      },
      {
        headers: {
          'Authorization': `Bearer ${jwt.access_token}`
        }
      }
    );
  }

  public async deleteAddressBookEntry(
    request: DeleteAddressBookEntryRequest,
    jwt: JwtToken
  ): Promise<void> {
    return this.instance.delete<AxiosResponse>(
      `address-book/${request.id}`,
      {
        headers: {
          'Authorization': `Bearer ${jwt.access_token}`
        }
      }
    );
  }

  public async fetchAddressBookEntryByAlias(
    request: FetchAddressBookEntryByAliasRequest,
    jwt: JwtToken
  ): Promise<AddressBookEntry> {
    return this.instance.get<AddressBookEntry>(
      `address-book/by-alias/${request.alias}`,
      {
        headers: {
          'Authorization': `Bearer ${jwt.access_token}`
        }
      }
    );
  }

  public async fetchAddressBookEntries(
    forWalletAddress: string,
    jwt: JwtToken
  ): Promise<AddressBookEntries> {
    return this.instance.get<AddressBookEntries>(
      `address-book/by-wallet-address/${forWalletAddress}`,
      {
        headers: {
          'Authorization': `Bearer ${jwt.access_token}`
        }
      }
    );
  }

  public async createAssetSendRequest(
    request: CreateAssetSendRequest
  ): Promise<AssetSendRequest> {
    return this.protectedInstance.post<AssetSendRequest>(
      'send',
      request
    );
  }

  public async fetchAssetSendRequest(id: string): Promise<AssetSendRequest> {
    return this.instance.get<AssetSendRequest>(
      `send/${id}`
    );
  }

  public async fetchAllAssetSendRequests(): Promise<AssetSendRequests> {
    return this.instance.get<AssetSendRequests>(
      `send/by-project/${this.projectId}`
    );
  }

  public async fetchAssetSendRequestsBySender(senderAddress: string): Promise<AssetSendRequests> {
    return this.instance.get<AssetSendRequests>(
      `send/by-sender/${senderAddress}`
    );
  }

  public async fetchAssetSendRequestsByRecipient(recipientAddress: string): Promise<AssetSendRequests> {
    return this.instance.get<AssetSendRequests>(
      `send/by-recipient/${recipientAddress}`
    );
  }
}
