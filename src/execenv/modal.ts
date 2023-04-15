import { SDKError } from '../common/error';
import { ContractCallAction } from '../core/actions/ContractCallAction';
import { ContractDeployAction } from '../core/actions/ContractDeployAction';
import { NativeSendRequestAction } from '../core/actions/NativeSendRequestAction';
import { TokenSendRequestAction } from '../core/actions/TokenSendRequestAction';
import { WalletAuthorizationAction } from '../core/actions/WalletAuthorizationAction';
import { MainApi } from '../core/api/main-api';
import { ensureBrowser, poll } from '../core/helpers/util';
import { RequestStatus } from '../core/types';

export type SupportedActionType =
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
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            background: rgba(0,0,0,0.6) !important;
            z-index: 999999 !important;
            width: 100% !important;
            height: 100% !important;
            display: block !important;
            padding: 32px 16px !important;
            -ms-overflow-style: none !important;  /* Internet Explorer 10+ */
            scrollbar-width: none !important;  /* Firefox */
        }

        .dev3-modal-container::-webkit-scrollbar { 
            display: none !important;  /* Safari and Chrome */
        }

        .dev3-modal-frame {
            width: 100% !important;
            margin: auto !important;
            max-width: 500px !important;
            display: block !important;
            border: none !important;
            border-radius: 16px !important;
            height: 100% !important;
            max-height: 700px !important;
        }

        .dev3-cancel-button {
          position: absolute !important;
          right: 24px !important;
          top: 10px !important;
          z-index: 1 !important;
          color: #f2f7ff !important;
          font-size: 2rem !important;
          background: transparent !important;
          border: none !important;
        }
    `;
  document.getElementsByTagName('head')[0].appendChild(css);

  const containerDiv = document.createElement('div');
  containerDiv.className = 'dev3-modal-container';
  containerDiv.innerHTML = `<iframe class='dev3-modal-frame' src="${
    actionUrl + '?sdk=true'
  }"/>`;
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
  };
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
