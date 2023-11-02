import "./styles.css";

import { DkgClient } from "dev3-sdk";

window.DkgClient = new DkgClient({
    endpoint: 'http://139.59.152.69',  // gateway node URI
    port: 8900,
    blockchain: {
        name: 'otp::testnet'//,
        // publicKey: "0x75bF490088b7B48C55e066D2f3c8CE030d43DcC1", // operational wallet address
        // privateKey: "0x999585c323b459eef929137be14ce1d16cbda6fcd5d357874ebd01eef9d0db3a", // operational wallet priv key
    }
});

document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use the same configuration as Parcel to bundle this sandbox, you can find more
  info about Parcel 
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
</div>
`;

document.getElementById("button").onclick = async () => {
  const publicAssertion = {
    '@context': 'https://schema.org',
    '@id': 'https://tesla.modelX/2321',
    '@type': 'Car',
    'name': 'Tesla Model X',
    'brand': {
        '@type': 'Brand',
        'name': 'Tesla'
    },
    'model': 'Model X',
    'manufacturer': {
        '@type': 'Organization',
        'name': 'Tesla, Inc.'
    },
    'fuelType': 'Electric',
    'numberOfDoors': 5,
    'vehicleEngine': {
        '@type': 'EngineSpecification',
        'engineType': 'Electric motor',
        'enginePower': {
        	'@type': 'QuantitativeValue',
        	'value': '416',
        	'unitCode': 'BHP'
        }
    },
    'driveWheelConfiguration': 'AWD',
    'speed': {
        '@type': 'QuantitativeValue',
        'value': '250',
        'unitCode': 'KMH'
    },
  }
  window.DkgClient.asset.create(publicAssertion, { epochsNum: 2 }).then((result) => {
    console.log("Asset created. Result: ", result);
  });
}
