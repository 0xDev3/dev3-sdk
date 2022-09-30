import { Dev3SDK } from '../src';

describe('Dev3 SDK', function () {

  it('sdk functions', async () => {
    
    // initialize SDK
    const sdk = new Dev3SDK(
      'pHziq.qsYUm1t8pHIXzPWI22LaM3/P3LkploFDWi7KgOI', // API KEY
      'ccfbfd23-1e65-406f-b9c2-6642d32e9dd4' // PROJECT ID
    );

    const authorizationAction = await sdk.authorize();
    console.log(`Authorization flow started! Open url ${authorizationAction.actionUrl}`)

    const result = await authorizationAction.awaitResult();
    console.log(`User authorized with status ${result.status}. User wallet: ${result.wallet}`);

  }).timeout(600000);

});
