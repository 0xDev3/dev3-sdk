import { Dev3SDK } from '../src';

describe('Dev3 SDK tests', function () {
  it('should be able to request a mint action usingdev3 sdk', async (done) => {
    const sdk = new Dev3SDK(
      'RnuEf.Ilzey1U2YhR4sVY9mrcJb42Tk1eP8YWyS2+10v0', // API KEY
      '1391f982-b1e5-4ae6-b6e4-d1d02d079be4' // PROJECT ID
    );
    const deployedContracts = await sdk.getDeployedContracts();
    await deployedContracts[2].execute(
      'mint',
      ['0x5013F6ce0f9Beb07Be528E408352D03f3FCa1857', '1000'],
      function (action) {
        console.log(
          'action created! url:',
          action.functionCallRequest?.redirect_url
        );
      },
      function (action) {
        console.log(
          'action executed! hash:',
          action.functionCallRequest?.function_call_tx.tx_hash
        );
        done();
      },
      {
        redirectUrl:
          'https://demo.dev3.sh/137/test-project-3/request-function-call/${id}/action',
      }
    );
  }).timeout(300000);
});
