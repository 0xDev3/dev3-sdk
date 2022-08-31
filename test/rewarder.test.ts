import { Dev3SDK } from '../src';

describe('Dev3 SDK tests', function () {
  it('should be able to fetch rewarder contracts with dev3 sdk', async () => {

    const sdk = new Dev3SDK(
      'RnuEf.Ilzey1U2YhR4sVY9mrcJb42Tk1eP8YWyS2+10v0', // API KEY
      '1391f982-b1e5-4ae6-b6e4-d1d02d079be4' // PROJECT ID
    );
    const rewarders = await sdk.getRewarderInstances();
    console.log(
      'rewarders',
      rewarders.map((r) => r.deploymentRequest.alias)
    );

  });
});
