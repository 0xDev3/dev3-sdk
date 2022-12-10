import { ContractCallAction } from './actions/ContractCallAction';
import { ContractDeployAction } from './actions/ContractDeployAction';
import { NativeSendRequestAction } from './actions/NativeSendRequestAction';
import { TokenSendRequestAction } from './actions/TokenSendRequestAction';
import { WalletAuthorizationAction } from './actions/WalletAuthorizationAction';
import { MainApi } from './api/main-api';
import { Contract } from './contracts/Contract';
import { ContractManifest } from './contracts/ContractManifest';
import { AssetType, CreateWalletAuthorizationRequest } from './types';
import * as ExecEnv from '../execenv/modal';

export class Dev3SDK {
  constructor(
    apiKey: string,
    projectId: string,
    baseApiUrl = 'https://invest-api.ampnet.io/api/blockchain-api/v1',
    identityApiUrl = 'https://invest-api.ampnet.io/api/identity'
  ) {
    MainApi.init(baseApiUrl, identityApiUrl, apiKey, projectId);
  }

  async authorizeWallet(
    options: CreateWalletAuthorizationRequest
  ): Promise<WalletAuthorizationAction> {
    const payloadResponse = await MainApi.instance().getPayload();
    const generatedAction =
      await MainApi.instance().createWalletAuthorizationRequest({
        ...options,
        message_to_sign: payloadResponse.payload,
      });
    return new WalletAuthorizationAction(generatedAction);
  }

  async getManifests(
    contractTags: string[] = [],
    contractImplements: string[] = []
  ): Promise<ContractManifest[]> {
    const result = await MainApi.instance().fetchDeployableContracts({
      tags: contractTags,
      implements: contractImplements,
    });
    return result.deployable_contracts.map((r) => new ContractManifest(r));
  }

  async getManifestById(id: string): Promise<ContractManifest> {
    const result = await MainApi.instance().fetchDeployableContractById(id);
    return new ContractManifest(result);
  }

  async getContracts(
    ids: string[] = [],
    deployedOnly = true,
    contractTags: string[] = [],
    contractImplements: string[] = []
  ): Promise<Contract[]> {
    const result = await MainApi.instance().fetchContractDeploymentRequests(
      ids,
      deployedOnly,
      contractTags,
      contractImplements
    );
    return result.requests.map((r) => new Contract(r));
  }

  async getContractByAlias(alias: string): Promise<Contract> {
    const result =
      await MainApi.instance().fetchContractDeploymentRequestByAlias(alias);
    return new Contract(result);
  }

  async getContractById(id: string): Promise<Contract> {
    const result = await MainApi.instance().fetchContractDeploymentRequestById(
      id
    );
    return new Contract(result);
  }

  async deleteContractById(id: string): Promise<void> {
    return MainApi.instance().deleteContractDeploymentRequestById(id);
  }

  async getContractCallById(id: string): Promise<ContractCallAction> {
    const result = await MainApi.instance().fetchFunctionCallRequestById(id);
    return new ContractCallAction(result);
  }

  async getContractDeployAction(id: string): Promise<ContractDeployAction> {
    const result = await MainApi.instance().fetchContractDeploymentRequestById(
      id
    );
    return new ContractDeployAction(result);
  }

  async requestTokens(
    toAddress: string,
    token: string,
    amount: string,
    fromAddress?: string
  ): Promise<TokenSendRequestAction> {
    const result = await MainApi.instance().createAssetSendRequest({
      asset_type: AssetType.TOKEN,
      recipient_address: toAddress,
      token_address: token,
      amount: amount,
      sender_address: fromAddress,
    });
    return new TokenSendRequestAction(result);
  }

  async requestNativeCoins(
    toAddress: string,
    amount: string,
    fromAddress?: string
  ): Promise<NativeSendRequestAction> {
    const result = await MainApi.instance().createAssetSendRequest({
      asset_type: AssetType.NATIVE,
      recipient_address: toAddress,
      amount: amount,
      sender_address: fromAddress,
    });
    return new NativeSendRequestAction(result);
  }

  async present(actionUrl: string): Promise<ExecEnv.SupportedActionType> {
    return ExecEnv.present(actionUrl);
  }
}
