import { Dev3SDK } from '../src';
import { RequestStatus } from '../src/core/types';

describe('Dev3 SDK', function () {

  it.only('sdk functions', async () => {
    // initialize SDK
    const sdk = new Dev3SDK(
      'mKrhA.m5qbJC04gpAHYu2D2Yb3iLMjO+vPVcZertMGO17', // API KEY
      'a5710f29-4fde-4284-947a-18e2dea6a222' // PROJECT ID
    );

    // BURN REQUEST FLOW
    // const myTokenContract = await sdk.getContractByAlias('my-token');
    // const action = await myTokenContract.buildAction('mint', [ "0x4Ed918C7800F5dc34d2C774f6EA5fbd15f1a94a7", "1000000000000000000" ]);
    // console.log(action.actionUrl);

    // const action = await myTokenContract.buildAction('burn', [ 100000 ]); 
    // const actionResult = await action.awaitResult()
    // if (actionResult.status === RequestStatus.SUCCESS) { 
    //   // your platform logic
    // }

    
    
    // AUTHORIZE REQUEST FLOW
    const authorizationAction = await sdk.authorizeWallet();       
    console.log(`Authorization flow started! Open url ${authorizationAction.actionUrl}`)
    const user = await authorizationAction.awaitResult();
    console.log(`${user.wallet} authorized.`);

    // ADD TO ADDRESS-BOOK
    const newEntry = await user.addToAddressBook({
      address: '0x4Ed918C7800F5dc34d2C774f6EA5fbd15f1a94a7',
      alias: 'random-addr'
    });
    console.log(`entry created, id: ${newEntry.id}`);

    const fetchedEntry = await user.getFromAddressBook('random-addr');
    console.log("fetched entry", fetchedEntry);

    await user.updateAddressBook({
      id: fetchedEntry.id,
      address: fetchedEntry.address,
      alias: "new-random-alias"
    });

    const updatedEntry = await user.getFromAddressBook('new-random-alias');
    console.log("updated entry", updatedEntry);
  }).timeout(600000);

});
