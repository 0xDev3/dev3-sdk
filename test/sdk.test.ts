import { Dev3SDK } from '../src';
import { Contract } from '../src/core/contracts/Contract';
import { solidityKeccak256, parseUnits, arrayify } from 'ethers/lib/utils';

describe('Dev3 SDK tests', function () {
  it('should be able to provoke various errors in the framework', async () => {
    const sdk = new Dev3SDK(
      'DmoC+.GfVLnRHi+GfVvj0+XfGLPLzyE+QvaDS7XvDok8U', // API KEY
      'c7783e2f-37b7-464e-9638-0c43889d19ab' // PROJECT ID
    );

    try {
      const c = await sdk.getContractByAlias('testttt'); // non existent contract
      await c.execute('addRewards', [], {
        onCreate: (action) => {
          console.log(
            `action created, url: ${action.functionCallRequest?.redirect_url}`
          );
        },
        onExecute: (action) => {
          console.log(
            `action executed, hash: ${action.functionCallRequest?.function_call_tx?.tx_hash}`
          );
        },
        redirectUrl:
          'https://demo.dev3.sh/137/test-project-3/request-function-call/${id}/action',
      });
    } catch (err) {
      console.log(err);
    }
  }).timeout(600000);

  it('should be able to request a mint action using dev3 sdk', async () => {
    const sdk = new Dev3SDK(
      'DmoC+.GfVLnRHi+GfVvj0+XfGLPLzyE+QvaDS7XvDok8U', // API KEY
      'c7783e2f-37b7-464e-9638-0c43889d19ab' // PROJECT ID
    );
    const supplyChain = await sdk.getContractByAlias('supply-2');
    const result = await supplyChain.read('getProducts', []);
    console.log('result', result.return_values);
  }).timeout(600000);

  it('should be able to generate 5 vouchers for my test token', async () => {
    interface VoucherList {
      vouchers: any[];
      secretCodes: string[];
    }

    function generateVouchers(
      amount: number,
      voucherManager: string,
      token: string,
      tokenValue: string,
      expiryMinutes = 30
    ): VoucherList {
      const vouchers: any[] = [];
      const secretCodes: string[] = [];
      for (let i = 0; i < amount; i++) {
        const secretCode = (Math.random() + 1).toString(36).substring(2);
        const hashString = solidityKeccak256(
          ['address', 'string'],
          [voucherManager, secretCode]
        );
        console.log('hash string', hashString);
        const hash = Array.from(arrayify(hashString)).map((it) =>
          it.toString()
        );

        const amount = parseUnits(tokenValue, 18);
        const expiresAt =
          parseInt((Date.now() / 1000).toString()) + expiryMinutes * 60;
        vouchers.push([hash, token, amount.toString(), 0, expiresAt]);
        secretCodes.push(secretCode);
        console.log(`Voucher ${i + 1} generated. Secret code: ${secretCode}`);
      }
      return {
        vouchers,
        secretCodes,
      };
    }

    async function generateVoucherLinks(
      voucherManager: Contract,
      vouchers: VoucherList
    ): Promise<string> {
      const links: string[] = await Promise.all(
        vouchers.secretCodes.map(async (v) => {
          const action = await voucherManager.execute('claimReward', [v], {
            redirectUrl:
              'https://demo.dev3.sh/137/test-project-3/request-function-call/${id}/action',
            screenConfig: {
              before_action_message:
                'Klikom na gumb iskoristit cete kupon u vrijednosti 0.1 VATRENI tokena.',
              after_action_message:
                'Kupon uspjesno iskoristen! Posjetite vas VATRENI novcanik ovdje da provjerite broj tokena koji posjedujete: https://tokenapp.biznisport.com/wallet',
            },
          });
          return action.functionCallRequest?.redirect_url ?? '';
        })
      );
      return links.join('\r\n');
    }

    const sdk = new Dev3SDK(
      'RnuEf.Ilzey1U2YhR4sVY9mrcJb42Tk1eP8YWyS2+10v0', // API KEY
      '1391f982-b1e5-4ae6-b6e4-d1d02d079be4' // PROJECT ID
    );
    const voucherToken = '0xD60DebA014459F07BBcC077a5B817f31DaFD5229';
    const voucherManager = await sdk.getContractByAlias(
      'COCA-COLA-SUMMER-CRAZE'
    );

    const vouchersList = generateVouchers(
      1, // generate 1 voucher, worth 100 tokens, with 60 minutes expiry
      voucherManager.deploymentRequest.contract_address!,
      voucherToken,
      '0.1',
      24 * 60
    );

    await voucherManager.execute('addRewards', [vouchersList.vouchers], {
      onCreate: async (action) => {
        console.log(
          `Activating vouchers, visit this link to confirm activation:\n${action.functionCallRequest?.redirect_url}`
        );
      },
      onExecute: async (action) => {
        console.log(
          `\nVouchers activated successfully! Secret activation links:\n`
        );
        const secretLinks = await generateVoucherLinks(
          voucherManager,
          vouchersList
        );
        console.log(secretLinks);
      },
      redirectUrl:
        'https://demo.dev3.sh/137/test-project-3/request-function-call/${id}/action',
    });
  }).timeout(600000);
});
