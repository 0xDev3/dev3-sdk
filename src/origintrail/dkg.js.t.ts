declare module 'dkg.js' {
    
    interface DkgBlockchainConfig {
        name: string;
        publicKey?: string;
        privateKey?: string;
    }
    
    interface DkgConfig {
        endpoint: string;
        port: number;
        blockchain?: DkgBlockchainConfig
    }
    
    interface DkgBlockchainOperationStatus {
        transactionHash: string;
        status: string;
    }

    type DkgOperationResultStatus = "PENDING" | "COMPLETED" | "FAILED";

    interface DkgOperationResult {
        status: DkgOperationResultStatus,
        data: any
    }

    class DkgAssetOperationsManager {
        
        // READ
        
        get(ual: string, options?: any): Promise<any>;
        getOwner(ual: string, options?: any): Promise<any>;
        getCurrentAllowance(options?: any): Promise<any>;
        getStateIssuer(ual: string, stateIndex: string, options?: any): Promise<any>;
        getLatestStateIssuer(ual: string, options?: any): Promise<any>
        getStates(ual: string, options?: any): Promise<any>;
        
        // WRITE
        create(content: any, options?: any): Promise<any>;
        update(ual: string, content: any, options?: any): Promise<any>;
        cancelUpdate(ual: string, options?: any): Promise<any>;
        waitFinalization(ual: string, options?: any): Promise<any>;
        transfer(ual: string, newOwner: string, options?: any): Promise<any>
        burn(ual: string, options?: any): Promise<any>;
        increaseAllowance(tokenAmount: number, options?: any): Promise<DkgBlockchainOperationStatus>;
        decreaseAllowance(tokenAmount: number, options?: any): Promise<DkgBlockchainOperationStatus>;
        extendStoringPeriod(ual: string, epochsNumber: number, options?: any): Promise<any>;
        addTokens(ual: string, options?: any): Promise<any>;
        addUpdateTokens(ual: string, options?: any): Promise<any>;
    }


    type DkgGraphQueryType = "CONSTRUCT" | "SELECT";
    type DkgGraphQueryStateLocation = "PUBLIC_KG" | "LOCAL_KG";
    type DkgGraphQueryStateType = "CURRENT" | "HISTORICAL";

    interface DkgAuthToken {
        token: string;
    }

    interface DkgGraphQueryOptions {
        graphLocation?: DkgGraphQueryStateLocation;
        graphState?: DkgGraphQueryStateType;
        endpoint?: string;
        port?: number;
        frequency?: number;
        auth?: DkgAuthToken;
    }

    class DkgGraphOperationsManager {
        query(
            queryString: string,
            queryType: DkgGraphQueryType,
            options?: DkgGraphQueryOptions
        ): Promise<DkgOperationResult>
    }
    
    interface DkgNodeGetInfoOptions {
        endpoint?: string;
        port?: number;
        authToken?: string;
    }

    interface DkgNodeGetInfoResult {
        version: string;
    }

    class DkgNodeOperationsManager {
        info(options?: DkgNodeGetInfoOptions): Promise<DkgNodeGetInfoResult>;
    }
    
    class DkgClient {
        constructor(config: DkgConfig);
        asset: DkgAssetOperationsManager;
        node: DkgNodeOperationsManager;
        graph: DkgGraphOperationsManager;
    }

    export default DkgClient;
}
