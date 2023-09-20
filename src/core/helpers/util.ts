import { SDKError } from '../../common/error';
import { ContractCallAction } from '../actions/ContractCallAction';
import { MainApi } from '../api/main-api';
import { EncodedFunctionParameter } from '../types';

const defaultPollIntervalSeconds = 3;

export async function poll<T>(
  fetchFn: () => Promise<T>,
  conditionFn: (response: T) => boolean,
  intervalSeconds: number = defaultPollIntervalSeconds
): Promise<T> {
  let result = await fetchFn();
  while (conditionFn(result)) {
    await wait(intervalSeconds * 1000);
    result = await fetchFn();
  }
  return result;
}

export const wait = function (ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export function isBrowser(): boolean {
  return (typeof window !== 'undefined');
}

export function ensureBrowser(): void {
  if (!isBrowser()) {
    throw new SDKError(
      'This feature is only available in browser environment!'
    );
  }
}

export async function readContract(
  contract_address: string,
  function_name: string,
  function_params: any[],
  output_params: string[],
  caller_address: string
) {
  return await MainApi.instance().readContract({
    contract_address,
    function_name,
    function_params,
    output_params,
    caller_address,
  });
}

export async function writeContract(
  contract_address: string,
  function_name: string,
  function_params: EncodedFunctionParameter[],
  eth_amount: string,
): Promise<ContractCallAction> {
  return new ContractCallAction(
    await MainApi.instance().createFunctionCallRequest({
      contract_address,
      function_name,
      function_params,
      eth_amount,
    })
  );
}

export async function fetchChainlist() {
  const chainlistResponse = await fetch(
    'https://raw.githubusercontent.com/0xpolyflow/polyflow-sdk/master/resources/chainlist.json'
  );
  const chainlistJson = await chainlistResponse.json();
  return new Map(Object.entries(chainlistJson));
}

export async function fetchChainlinkContractsAddresses() {
  const tokenAndCoordinatorAddressesResponse = await fetch(
    'https://raw.githubusercontent.com/0xPolycode/polyflow-sdk/master/resources/chainlink_contracts.json'
  );
  const tokenAndCoordinatorAddressesJson = await tokenAndCoordinatorAddressesResponse.json();
  return new Map(Object.entries(tokenAndCoordinatorAddressesJson));
}
