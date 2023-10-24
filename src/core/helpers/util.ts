import { SDKError } from '../../common/error';
import { ContractCallAction } from '../actions/ContractCallAction';
import { MainApi } from '../api/main-api';
import { EncodedFunctionOutput, EncodedFunctionParameter } from '../types';
import { ethers, TransactionResponse } from 'ethers';

const defaultPollIntervalSeconds = 3;
export let web3provider: ethers.JsonRpcProvider;

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

export async function getWeb3Provider(chainId: string): Promise<ethers.JsonRpcProvider> {
  const chainlist = await fetchChainlist();
  web3provider = new ethers.JsonRpcProvider(chainlist.get(chainId));
  return web3provider;
}

export async function readContract(
  contract_address: string,
  function_name: string,
  function_params: EncodedFunctionParameter[],
  output_params: EncodedFunctionOutput[],
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

export async function signAndSendTransaction(
  contract_address: string,
  function_name: string,
  pk: string,
  parameter_names?: string[],
  function_params?: [EncodedFunctionParameter],
): Promise<TransactionResponse> {
  let formattedParameters: string[] = [];
  let transactionParams: any = '';
  const signer = new ethers.Wallet(pk, web3provider);
  const signerPublicAddress = await signer.getAddress();
  if (parameter_names && function_params) {
    formattedParameters = function_params.map((param, index) => {
      return `${param.type} ${parameter_names[index]}`;
    });
    transactionParams = function_params.map(param => param.value).join('');
  }
  const abi = [`function ${function_name}(${formattedParameters.join(', ')})`];
  const iface = new ethers.Interface(abi);
  const transactionRequest: ethers.TransactionRequest = {
    chainId: await web3provider.getNetwork().then(network => Number(network.chainId)),
    gasPrice: await web3provider.getFeeData().then(feedata => Number(feedata.gasPrice)),
    nonce: await web3provider.getTransactionCount(signerPublicAddress),
    from: signerPublicAddress,
    to: contract_address,
    data: iface.encodeFunctionData(function_name, transactionParams)
  };
  transactionRequest.gasLimit = await signer.estimateGas(transactionRequest);
  const signedTransaction = await signer.signTransaction(transactionRequest);
  const submittedTransaction = await web3provider.broadcastTransaction(signedTransaction);
  return submittedTransaction;
}

export async function fetchChainlist(): Promise<Map<string, string>> {
  const chainlistResponse = await fetch(
    'https://raw.githubusercontent.com/0xpolyflow/polyflow-sdk/master/resources/chainlist.json'
  );
  const chainlistJson = await chainlistResponse.json();
  return new Map(Object.entries(chainlistJson));
}

export async function fetchChainlinkContractsAddresses(): Promise<Map<string, string>> {
  const tokenAndCoordinatorAddressesResponse = await fetch(
    'https://raw.githubusercontent.com/0xPolycode/polyflow-sdk/master/resources/chainlink_contracts.json'
  );
  const tokenAndCoordinatorAddressesJson = await tokenAndCoordinatorAddressesResponse.json();
  return new Map(Object.entries(tokenAndCoordinatorAddressesJson));
}
