import "./styles.css";

import {Dev3SDK, DkgClient} from "dev3-sdk";
const BigNumber = require("bignumber.js");

// 1. Activate Dev3 Widget support (Attach to Dev3 XDAI Workspace)
const DEV3 = Dev3SDK.attach(
    "",  // DEV3 API key
    ""   // DEV3 Project ID
); // get your credentials at https://app.dev3.sh 

// 2. Initialize Dev3 DKG SDK
window.DkgClient = new DkgClient({
    endpoint: 'http://dkg-mainnet.dev3.sh',  // gateway node URI
    port: 8900,
    blockchain: {
        name: 'gnosis:100'
    }
});

// 3. Test asset will be stored on the DKG
const TEST_ASSET = {
    '@context': 'https://schema.org',
    '@id': 'https://tesla.modelY/2321',
    '@type': 'Car',
    'name': 'Tesla Model Y',
    'brand': {
        '@type': 'Brand',
        'name': 'Tesla'
    },
    'model': 'Model Y',
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

document.getElementById("connect-button").onclick = async () => {
    const TRAC_TOKEN_ADDRESS_XDAI = "0xEddd81E0792E764501AaE206EB432399a0268DB5";
    try {
        const authAction = await DEV3.authorizeWallet();
        const result = await authAction.present();
        const tracBalance = (await DEV3.readContract(TRAC_TOKEN_ADDRESS_XDAI, "balanceOf", [{
            type: "address",
            value: result.wallet
        }], [ "uint256" ])).return_values[0];
        const tracBalanceFormatted = BigNumber(tracBalance).div(BigNumber("1000000000000000000")).toString();

        document.getElementById("connect-button").style.display = "none";
        if (tracBalanceFormatted == 0) {
            document.getElementById("connect-status").innerHTML = `
                Wallet ${result.wallet} connected!<br />
                TRAC Balance: ${tracBalanceFormatted} TRAC<br />
                <p style="color: red;">TRAC BALANCE NOT ENOUGH TO STORE AN ASSET!
            `;
        } else {
            document.getElementById("store-asset").style.display = "block";
            document.getElementById("connect-status").innerHTML = `
                Wallet ${result.wallet} connected!<br />
                TRAC Balance: ${tracBalanceFormatted} TRAC
            `;
        }
    } catch (err) {
        console.log("err", err);
        document.getElementById("connect-button").style.display = "none";
        document.getElementById("connect-status").innerHTML = `ERROR: DEV3 SDK not initialized properly! Check API key & Project ID in the 'index.mjs' file in this project root.`
    }

}

document.getElementById("store-asset").onclick = async () => {

    window.DkgClient.node.info().then((result) => {
        console.log("Node info result: ", result);
    });

    window.DkgClient.asset.create(TEST_ASSET, {epochsNum: 1}).then((result) => {
        const explorerLink = "https://dkg.origintrail.io/explore?ual=" + result.UAL;
        document.getElementById("store-asset").style.display = "none";
        document.getElementById("create-status").innerHTML = `
            Asset created successfully! <br />
            UAL: ${result.UAL} <br />
            Asset on DKG Explorer: <a href="${explorerLink}" target="_blank">LINK</a>
        `;
    }).catch((err) => {
        console.log("error caught: ", err);
    });
}
