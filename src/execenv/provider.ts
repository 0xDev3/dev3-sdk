import { ensureBrowser } from "../core/helpers/util";
import { Dev3SDK } from "../core/sdk";
import { MainApi } from "../core/api/main-api";

let proxy: any;
let connectedAccounts: string[];

export function attach(sdk: Dev3SDK) {
    ensureBrowser();
    configureMessageListener();
    (window as any).dev3 = sdk;

    if (!proxy) {
        proxy = new Proxy((window as any).ethereum || {}, handler);
        console.log("Dev3 Middleware attached!");
    }

    Object.defineProperty(window, "ethereum", {
        get() {
            return proxy;
        },
        set(newProvider) {
            proxy = new Proxy(newProvider, handler);
        },
        configurable: true
    });
}

const proxiedFunctions = ['request'];

const handler = {

    txReceipts: {} as any,

    get(target: any, prop: any, receiver: any) {
        if (prop === 'enable') {
            console.log('Skipping enable() call...');
            return () => {}; // 'enable' is a property that has function value
        }

        if (!proxiedFunctions.includes(prop)) {
            return Reflect.get(target, prop, receiver);
        }

        return async (...args: any) => {
            const arg0IsMethodString = typeof args[0] === "string";
            const method = arg0IsMethodString ? args[0] : args[0].method;
            const params = arg0IsMethodString ? args[1] : args[0].params;

            console.log('Intercepting call: ', method);
            console.log('With params: ', params);

            switch (method) {
                case 'eth_call':
                    return callReadonlyFunction(params[0].to, params[0].data);
                case 'eth_requestAccounts':
                    return getAccounts(method);
                case 'eth_accounts':
                    if (connectedAccounts.length > 0) {
                        return connectedAccounts;
                    } else {
                        return getAccounts(method);
                    }
                case 'eth_getTransactionReceipt':
                    console.log('Dev3 Middleware: get transaction receipt handler triggered.');

                    const txReceipt = handler.txReceipts[params[0]];

                    if (!!txReceipt && txReceipt.type === "arbitrary-call") {
                        return getContractArbitraryCallTransactionReceipt(txReceipt.id);
                    } else {
                        const result = await Reflect.get(target, prop, receiver)(...args);
                        console.log(
                          `Dev3 Middleware: no arbitrary call ID found for transaction hash '${params[0]}',` +
                          `falling back to provider call for ${method}. Result: `, result
                        );
                        return result;
                    }
                case 'eth_estimateGas':
                    console.log('Dev3 Middleware: estimate gas cost handler triggered.');
                    return await estimateGasCost(params[0]);
                case 'eth_gasPrice':
                    console.log('Dev3 Middleware: get gas price handler triggered.');
                    return await getGasPrice();
                case 'eth_sendTransaction':
                    console.log('Dev3 Middleware: send transaction handler triggered.');
                    const sendResult = await performContractArbitraryCallRequest(params[0]);

                    if (!!sendResult.txHash) {
                        handler.txReceipts[sendResult.txHash] = { type: "arbitrary-call", id: sendResult.id }
                    }

                    return sendResult.txHash;
                default:
                    const result = await Reflect.get(target, prop, receiver)(...args);
                    console.log(`Dev3 Middleware: forwarded call ${method} to an actual provider. Result: `, result);
                    return result;
            }
        }
    }
}

async function callReadonlyFunction(contractAddress: string, callData: string) {
    console.log("Calling readonly contract function...");
    const readResult = await sdk().readContractWithRawData(contractAddress, callData, []);
    console.log("Readonly call successful, result:", readResult);
    return readResult.raw_return_value;
}

async function estimateGasCost(params: { data?: string, from?: string, to: string, value?: string }) {
    console.log("Estimating gas price:", params);
    const estimateResult = await MainApi.instance().estimateArbitraryCallGasCost({
        contract_address: params.to,
        function_data: params.data || "",
        eth_amount: params.value || "0",
        caller_address: params.from
    });
    const hexEstimate = "0x" + (BigInt(estimateResult.gas_estimate)).toString(16);
    console.log(`Gas cost estimate: ${hexEstimate}`);
    return hexEstimate;
}

async function getGasPrice() {
    console.log("Fetching current gas price");
    const gasPriceResult = await MainApi.instance().getGasPrice();
    const hexPrice = "0x" + (BigInt(gasPriceResult.gas_price)).toString(16);
    console.log(`Gas price: ${hexPrice}`);
    return hexPrice;
}

async function getAccounts(method: string) {
    console.log('Generating auth action...');
    const authAction = await sdk().authorizeWallet({});
    console.log(`Auth action generated! Url: ${authAction.actionUrl}`);
    const authActionResult = await authAction.present();
    console.log(`Dev3 Middleware: intercepted call ${method} and executed on middleware. Result: `, authActionResult);
    if (authActionResult) {
        connectedAccounts = [ authActionResult.wallet ];
        return connectedAccounts;
    } else { return []; }
}

type TxData = {
    data?: string
    value?: string
    from: string
    to: string
    gas: string
    gasPrice: string
}

async function performContractArbitraryCallRequest(txData: TxData): Promise<{ txHash?: string, id: string }> {
    console.log("Generating send tx action...", txData);
    const action = await sdk().contractArbitraryCall(txData);
    console.log(`Contract arbitrary call action generated! Url: ${action.actionUrl}`);
    const actionResult = await action.present();
    console.log(
      `Dev3 Middleware: intercepted call eth_sendTransaction and executed on middleware. Result: `, actionResult
    );
    return { txHash: actionResult.transactionHash, id: actionResult.id };
}

async function getContractArbitraryCallTransactionReceipt(id: string) {
    console.log(`Fetching contract arbitrary call by id: ${id}`);
    const arbitraryCall = await MainApi.instance().fetchContractArbitraryCallRequestById(id);
    console.log(`Fetched contract arbitrary call`, arbitraryCall);
    return JSON.parse(arbitraryCall.arbitrary_call_tx.raw_rpc_transaction_receipt);
}

function sdk(): Dev3SDK {
    return ((window as any).dev3) as Dev3SDK;
}

const messageHandler = async (message: MessageEvent) => {
    console.log(`Dev3 Middleware: Message event received!`);
    console.log(`Dev3 Middleware: origin ${message.origin}`);
    console.log(`Dev3 Middleware: isTrusted ${message.isTrusted}`);
    console.log(`Dev3 Middleware: data`, message.data);
}

function configureMessageListener() {
    // remove if it already existed
    window.removeEventListener('message', messageHandler);

    // add fresh listener instance
    window.addEventListener('message', messageHandler);
}
