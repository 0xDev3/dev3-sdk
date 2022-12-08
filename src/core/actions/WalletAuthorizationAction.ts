import { WalletAuthorizationRequest, RequestStatus } from '../types';
import { poll } from '../helpers/util';
import { MainApi } from '../api/main-api';
import { User } from '../identity/User';
import { SDKError } from '../../common/error';
import * as ExecEnv from '../../execenv/modal';

export class WalletAuthorizationAction {
  private readonly authorizationRequest: WalletAuthorizationRequest;

  constructor(authorizationRequest: WalletAuthorizationRequest) {
    this.authorizationRequest = authorizationRequest;
  }

  get actionUrl(): string {
    return this.authorizationRequest.redirect_url;
  }

  get status(): RequestStatus {
    return this.authorizationRequest.status;
  }

  get wallet(): string | undefined {
    return this.authorizationRequest.wallet_address;
  }

  public async present(): Promise<User | undefined> {
    const authAction = (await ExecEnv.present(
      this.actionUrl
    )) as WalletAuthorizationAction;
    if (
      !authAction.authorizationRequest.signed_message ||
      !authAction.authorizationRequest.wallet_address ||
      authAction.authorizationRequest.status !== RequestStatus.SUCCESS
    ) {
      return undefined;
    }

    const jwt = await MainApi.instance().getJwtByMessage({
      message_to_sign: authAction.authorizationRequest.message_to_sign,
      signed_payload: authAction.authorizationRequest.signed_message!,
      address: authAction.authorizationRequest.wallet_address!,
    });

    return new User(authAction.wallet!, jwt);
  }

  public async awaitResult(): Promise<User> {
    return new Promise((resolve, reject) => {
      poll<WalletAuthorizationRequest>(
        () =>
          MainApi.instance().fetchWalletAuthorizationRequestById(
            this.authorizationRequest.id
          ),
        (response) => response.status === RequestStatus.PENDING
      )
        .then((result) => {
          if (
            !result.signed_message ||
            !result.wallet_address ||
            result.status !== RequestStatus.SUCCESS
          ) {
            reject(new SDKError(`Failed to authorize.`));
          }
          MainApi.instance()
            .getJwtByMessage({
              message_to_sign: result.message_to_sign,
              signed_payload: result.signed_message!,
              address: result.wallet_address!,
            })
            .then((jwt) => {
              resolve(new User(result.wallet_address!, jwt));
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
