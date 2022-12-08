import { MainApi } from '../api/main-api';
import { poll } from '../helpers/util';
import * as ExecEnv from '../../execenv/modal';
import { AssetSendRequest, RequestStatus } from '../types';

export class NativeSendRequestAction {
  private readonly sendRequest: AssetSendRequest;

  constructor(sendRequest: AssetSendRequest) {
    this.sendRequest = sendRequest;
  }

  get actionUrl(): string {
    return this.sendRequest.redirect_url;
  }

  get status(): RequestStatus {
    return this.sendRequest.status;
  }

  get amount(): string {
    return this.sendRequest.amount;
  }

  get sender(): string | undefined {
    return this.sendRequest.sender_address;
  }

  get receiver(): string | undefined {
    return this.sendRequest.recipient_address;
  }

  get transactionHash(): string | undefined {
    return this.sendRequest.send_tx.tx_hash;
  }

  public async present(): Promise<NativeSendRequestAction> {
    return (await ExecEnv.present(this.actionUrl)) as NativeSendRequestAction;
  }

  public awaitResult(): Promise<NativeSendRequestAction> {
    return new Promise((resolve, reject) => {
      poll<AssetSendRequest>(
        () => MainApi.instance().fetchAssetSendRequest(this.sendRequest.id),
        (response) => response.status === RequestStatus.PENDING
      )
        .then((result) => {
          resolve(new NativeSendRequestAction(result));
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}
