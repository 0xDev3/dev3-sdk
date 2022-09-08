import { Dev3SDK } from '../src';

describe('Dev3 SDK tests', function () {
  it('should be able to request a mint action usingdev3 sdk', async () => {
    const sdk = new Dev3SDK(
      'RnuEf.Ilzey1U2YhR4sVY9mrcJb42Tk1eP8YWyS2+10v0', // API KEY
      '1391f982-b1e5-4ae6-b6e4-d1d02d079be4' // PROJECT ID
    );
    const contract = await sdk.getContractByAlias('supply-2');
    const result = await contract.read('getUsers', []);
    console.log('result', result);
  }).timeout(300000);
});
