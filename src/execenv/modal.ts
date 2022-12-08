import { SDKError } from '../common/error';
import { ContractCallAction } from '../core/actions/ContractCallAction';
import { ContractDeployAction } from '../core/actions/ContractDeployAction';
import { NativeSendRequestAction } from '../core/actions/NativeSendRequestAction';
import { TokenSendRequestAction } from '../core/actions/TokenSendRequestAction';
import { WalletAuthorizationAction } from '../core/actions/WalletAuthorizationAction';
import { MainApi } from '../core/api/main-api';
import { ensureBrowser, poll } from '../core/helpers/util';
import { RequestStatus } from '../core/types';

type SupportedActionType =
  | ContractDeployAction
  | ContractCallAction
  | WalletAuthorizationAction
  | TokenSendRequestAction
  | NativeSendRequestAction;

export async function present(actionUrl: string): Promise<SupportedActionType> {
  ensureBrowser();

  const actionUuid = extractUuidFromUrl(actionUrl);
  console.log(actionUuid);
  if (!actionUuid) {
    throw new SDKError(
      `Invalid action url. No action uuid found in the ${actionUrl}`
    );
  }

  let actionDataFetcher: () => Promise<SupportedActionType>;
  if (actionUrl.includes('/request-deploy')) {
    actionDataFetcher = async () => {
      const response =
        await MainApi.instance().fetchContractDeploymentRequestById(actionUuid);
      return new ContractDeployAction(response);
    };
  } else if (actionUrl.includes('/request-function-call')) {
    actionDataFetcher = async () => {
      const response = await MainApi.instance().fetchFunctionCallRequestById(
        actionUuid
      );
      return new ContractCallAction(response);
    };
  } else if (actionUrl.includes('/request-authorization')) {
    actionDataFetcher = async () => {
      const response =
        await MainApi.instance().fetchWalletAuthorizationRequestById(
          actionUuid
        );
      return new WalletAuthorizationAction(response);
    };
  } else if (actionUrl.includes('/request-send')) {
    actionDataFetcher = async () => {
      const response = await MainApi.instance().fetchAssetSendRequest(
        actionUuid
      );
      if (response.token_address) {
        return new TokenSendRequestAction(response);
      } else {
        return new NativeSendRequestAction(response);
      }
    };
  } else {
    throw new SDKError(
      `Could not parse action url. Given url ${actionUrl} is not a request-deploy, request-function-call, request-send or request-authorization action.`
    );
  }

  const css = document.createElement('style');
  css.innerHTML = `
        .dev3-modal-container {
            position: fixed;
            top: 0;
            left: 0;
            background: rgba(0,0,0,0.6);
            z-index: 1;
            width: 100%;
            height: 100%;
            display: block;
            padding: 32px 16px;
            -ms-overflow-style: none;  /* Internet Explorer 10+ */
            scrollbar-width: none;  /* Firefox */
        }

        .dev3-modal-container::-webkit-scrollbar { 
            display: none;  /* Safari and Chrome */
        }

        .dev3-modal-frame {
            width: 100%;
            margin: auto;
            max-width: 500px;
            display: block;
            border: none;
            border-radius: 16px;
            height: 100%;
            max-height: 700px;
        }

        .dev3-cancel-button {
          position: absolute;
          right: 24px;
          top: 10px;
          z-index: 1;
          color: #f2f7ff;
          font-size: 2rem;
        }
    `;
  document.getElementsByTagName('head')[0].appendChild(css);
  
  const containerDiv = document.createElement('div');
  containerDiv.className = 'dev3-modal-container';
  containerDiv.innerHTML = `<iframe class='dev3-modal-frame' src="${actionUrl + '?sdk=true'}"/>`;
  const cancelButton = document.createElement('button');
  cancelButton.className = 'dev3-cancel-button';
  cancelButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke-width="1.5" stroke="currentColor" width="32px" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    /svg>
  `;
  cancelButton.onclick = () => {
    containerDiv.remove();
    css.remove();
  }
  containerDiv.appendChild(cancelButton);
  document.body.appendChild(containerDiv);

  return awaitResult(containerDiv, css, actionDataFetcher);
}

function awaitResult(
  forModal: HTMLDivElement,
  withCss: HTMLStyleElement,
  actionDataFetcher: () => Promise<SupportedActionType>
): Promise<SupportedActionType> {
  return new Promise((resolve, reject) => {
    poll<SupportedActionType>(actionDataFetcher, (response) => {
      return response.status === RequestStatus.PENDING && forModal.isConnected;
    })
      .then((result) => {
        forModal.remove();
        withCss.remove();
        resolve(result);
      })
      .catch((err) => {
        forModal.remove();
        withCss.remove();
        reject(err);
      });
  });
}

function extractUuidFromUrl(actionUrl: string): string | undefined {
  const matches = actionUrl.match(/([a-fA-F0-9\d-]+)\/action/);
  const UUID = matches?.at(1);
  return UUID;
}
