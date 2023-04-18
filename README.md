# Dev3 SDK (TypeScript)

SDK built for interacting with the Dev3 platform.
The demo version of the platform is available [here](demo.dev3.sh).

The Dev3 platform provides a nice UI to interact with the blockchain, deploy new or import existing smart contracts and call various smart contrac functions on a click.

This SDK on the other hand provides the support for all of the above via various functions exposed through the sdk package, meaning, you can easily integrate the sdk to the existing web projects regardless of the technology stack being used, and 

The simplest way to start using the SDK is to run

```shell
$ npm install dev3-sdk
``` 

inside your project root and then intialize the singleton object inside your application (be it nodejs, browser based, or other) like this:

```javascript
import { Dev3SDK } from "dev3-sdk";
// or 
const { Dev3SDK } = require("dev3-sdk")
...
const sdk = new Dev3SDK("your-api-key", "your-project-id"); 
```

The `"your-api-key"` and `"your-project-id"` fields can be found on your project details page after you go to the [demo platform](demo.dev3.sh) and create a new project.

## Chainlink SDK

While using the Dev3 SDK you will automatically get an access to the Chainlink Data Feeds by following the simple instructions in the
[Chainlink docs](./docs/CHAINLINK.md).

## Build

Make sure you update your environment to NodeJS v16 before running the steps below.

To clone and build the project, this is the way:

```code
$ git clone https://github.com/0xdev3/dev3-sdk

$ npm install
 
$ npm run build
```

## Test

```code
$ npm run test
```
