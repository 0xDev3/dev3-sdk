import { DkgClient } from "dev3-sdk";

const dkg = new DkgClient({
    endpoint: 'http://dkg-mainnet.dev3.sh',  // gateway node URI
    port: 8900,
    blockchain: {
        name: 'otp::mainnet',
        //publicKey: "",
        //privateKey: "",
    }
});

// const publicAssertion = {
//     '@context': 'https://schema.org',
//     '@id': 'https://tesla.modelY/2331',
//     '@type': 'Car',
//     'name': 'Tesla Model Y',
//     'brand': {
//         '@type': 'Brand',
//         'name': 'Tesla'
//     },
//     'model': 'Model Y',
//     'manufacturer': {
//         '@type': 'Organization',
//         'name': 'Tesla, Inc.'
//     },
//     'fuelType': 'Electric',
//     'numberOfDoors': 5,
//     'vehicleEngine': {
//         '@type': 'EngineSpecification',
//         'engineType': 'Electric motor',
//         'enginePower': {
//         	'@type': 'QuantitativeValue',
//         	'value': '416',
//         	'unitCode': 'BHP'
//         }
//     },
//     'driveWheelConfiguration': 'AWD',
//     'speed': {
//         '@type': 'QuantitativeValue',
//         'value': '250',
//         'unitCode': 'KMH'
//     },
// }

// read operation example

dkg.node.info().then((result) => {
    console.log("Node info result: ", result);
});

// // write operation example (using pub/priv key of an operational wallet which is funded with native coins and TRAC tokens)
// // const testAssetContent = { a: 1, b: 2, c: 3 };
// dkg.asset.create(publicAssertion, { epochsNum: 2 }).then((result) => {
//     console.log("Asset created. Result: ", result);
// });
