# Dev3 SDK (TypeScript)

SDK built for interacting with the Dev3 platform.
The demo version of the platform is available [here](https://app.dev3.sh/).

The Dev3 platform provides a nice UI to interact with the blockchain, deploy new or import existing smart contracts, and call various smart contract functions with a single click.

This SDK provides the support the Dev3 platform via various functions exposed through the sdk package; you can easily integrate the sdk to existing web projects regardless of the technology stack being used. 

The simplest way to start using the SDK is to run the following command in your project's root directory:

```shell
$ npm install dev3-sdk
``` 

Then intialize the singleton object inside your application (be it nodejs, browser based, or other) like this:

```javascript
import { Dev3SDK } from "dev3-sdk";
// or 
const { Dev3SDK } = require("dev3-sdk")
...
const sdk = new Dev3SDK("your-api-key", "your-project-id"); 
```

`"your-api-key"` and `"your-project-id"` values can be found on your project details page in the [demo platform](https://app.dev3.sh/) and create a new project.

## Chainlink SDK

Using Dev3 SDK automatically provides youaccess to Chainlink Data Feeds. Follow the instructions in the
[Chainlink docs](./docs/CHAINLINK.md).

Take a look at [Example React App](https://github.com/0xDev3/chainlink-sdk-example-react-app) too see how to use Chainlink Dev3 SDK inside your project!

## Build

Update your environment to NodeJS v16 before running the steps below.

To clone and build the project, run the following command in your terminal:

```code
$ git clone https://github.com/0xdev3/dev3-sdk

$ npm install
 
$ npm run build
```

## Test

```code
$ npm run test
```
