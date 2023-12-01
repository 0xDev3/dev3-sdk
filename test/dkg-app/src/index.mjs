import "./styles.css";

import {Dev3SDK, DkgClient} from "dev3-sdk";

// Activate Dev3 Widget support
Dev3SDK.attach("dev3-api-key", "dev3-project-id");

window.DkgClient = new DkgClient({
    endpoint: 'https://otp-testnet.dev3.sh/',  // gateway node URI
    port: 8900,
    blockchain: {
        name: 'otp::testnet',
        // publicKey: "", // operational wallet address
        // privateKey: "", // operational wallet priv key
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

    // read operation example
    window.DkgClient.node.info().then((result) => {
        console.log("Node info result: ", result);
    });

    window.DkgClient.asset.create(publicAssertion, {epochsNum: 2}).then((result) => {
        window.alert(`Asset created. Result: ${JSON.stringify(result)}`);
    });
}
