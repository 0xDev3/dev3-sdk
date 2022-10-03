import { Dev3SDK } from '../src';

describe('Dev3 SDK', function () {

  it('sdk functions', async () => {
    // initialize SDK
    const sdk = new Dev3SDK(
      'eng1I.2R82t/B3UPozCylXgNVx2OxvKj0b7qjKYLEXgHd', // API KEY
      'e72904ac-4f48-497f-83ed-58b28ef10873' // PROJECT ID
    );

    const authorizationAction = await sdk.authorizeWallet();
    console.log(`Authorization flow started! Open url ${authorizationAction.actionUrl}`)

    const user = await authorizationAction.awaitResult();
    console.log(`${user.wallet} authorized.`);

    const newEntry = await user.addToAddressBook({
      address: '0x4Ed918C7800F5dc34d2C774f6EA5fbd15f1a94a7',
      alias: 'random-addr'
    });
    console.log(`entry created, id: ${newEntry.id}`);
  }).timeout(600000);

});
