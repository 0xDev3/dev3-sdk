import { SDKError } from '../../common/error';
import {
  DeployableContract,
  FunctionParameter,
  EncodedFunctionParameter,
  EncodedFunctionParameterValue,
  EncodedFunctionOutput,
  ContractFunction,
  ContractConstructor,
} from '../types';

export class MapperService {
  private static _instance?: MapperService;

  public static instance(): MapperService {
    if (!MapperService._instance) {
      MapperService._instance = new MapperService();
    }
    return MapperService._instance;
  }

  public encodeConstructorInputs(
    functionValues: any[],
    manifest: DeployableContract
  ): EncodedFunctionParameter[] {
    if (functionValues.length === 0) {
      return [];
    }
    const constructorDecorator = this.getConstructorDecoratorFromManifest(
      manifest,
      functionValues.length
    );
    const inputDecorators = constructorDecorator.inputs;
    return this.encodeInputsImpl(functionValues, inputDecorators);
  }

  public encodeInputs(
    functionName: string,
    functionValues: any[],
    manifest: DeployableContract
  ): EncodedFunctionParameter[] {
    if (functionValues.length === 0) {
      return [];
    }
    const functionDecorator = this.getFunctionDecoratorFromManifest(
      functionName,
      manifest
    );
    const inputDecorators = functionDecorator.inputs;
    return this.encodeInputsImpl(functionValues, inputDecorators);
  }

  public encodeOutputTypes(
    functionName: string,
    manifest: DeployableContract
  ): EncodedFunctionOutput[] {
    const functionDecorator = this.getFunctionDecoratorFromManifest(
      functionName,
      manifest
    );
    const outputDecorators = functionDecorator.outputs;
    return this.encodeOutputTypesImpl(outputDecorators);
  }

  private encodeInputsImpl(
    functionValues: any[],
    inputDecorators?: FunctionParameter[]
  ): EncodedFunctionParameter[] {
    if (!inputDecorators) {
      return [];
    }
    return inputDecorators.map((decorator, index) => {
      const type = decorator.solidity_type;
      const value = this.encodeInputValue(
        functionValues[index],
        decorator,
        type
      );
      return { type, value } as EncodedFunctionParameter;
    });
  }

  private encodeOutputTypesImpl(
    outputDecorators?: FunctionParameter[]
  ): EncodedFunctionOutput[] {
    if (!outputDecorators) {
      return [];
    }
    return outputDecorators.map((decorator) => {
      if (decorator.solidity_type.startsWith('tuple')) {
        const nestedStruct = this.encodeOutputTypesImpl(decorator.parameters);
        return {
          type: decorator.solidity_type,
          elems: nestedStruct,
        };
      } else {
        return decorator.solidity_type;
      }
    });
  }

  private encodeInputValue(
    value: any,
    decorator: FunctionParameter,
    solidityType: string
  ): EncodedFunctionParameterValue {
    if (solidityType.endsWith(']')) {
      const solidityTypeWithoutArray = solidityType.substring(
        0,
        solidityType.lastIndexOf('[')
      );
      return ((value as any[]) ?? []).map((v) => {
        return this.encodeInputValue(
          v,
          decorator,
          solidityTypeWithoutArray
        ) as EncodedFunctionParameterValue;
      });
    } else {
      if (solidityType.startsWith('tuple')) {
        const tupleParameters = decorator.parameters;
        if (!tupleParameters) {
          throw new SDKError(
            `Expected tuple definition but nothing found for decorator ${decorator.name} and function ${decorator.solidity_name}`
          );
        }
        return ((value as any[]) ?? []).map((v, i) => {
          return {
            type: tupleParameters[i].solidity_type,
            value: this.encodeInputValue(
              v,
              tupleParameters[i],
              tupleParameters[i].solidity_type
            ),
          } as EncodedFunctionParameter;
        });
      } else {
        if (solidityType === 'bool') return Boolean(value);
        else if (solidityType.startsWith('bytes')) {
          return ((value as any[]) ?? []).map((v) => String(v));
        } else if (
          solidityType.startsWith('uint') ||
          solidityType.startsWith('int') ||
          solidityType.startsWith('byte') ||
          solidityType.startsWith('address') ||
          solidityType.startsWith('string')
        ) {
          return String(value);
        } else {
          throw new SDKError(
            `Could not parse solidity type: ${solidityType} for function ${decorator.name}`
          );
        }
      }
    }
  }

  private getConstructorDecoratorFromManifest(
    contractDecorator: DeployableContract,
    paramsCount: number
  ): ContractConstructor {
    const constructorDecorator = contractDecorator.constructors.find(
      (decorator) => decorator.inputs.length === paramsCount
    );
    if (!constructorDecorator) {
      throw new SDKError(
        `Can't deploy contract. Constructor with ${paramsCount} param(s) not found in contract descriptor.`
      );
    }
    return constructorDecorator;
  }

  private getFunctionDecoratorFromManifest(
    functionName: string,
    contractDecorator: DeployableContract
  ): ContractFunction {
    const functionDecorator = contractDecorator.functions.find(
      (decorator) => decorator.solidity_name === functionName
    );
    if (!functionDecorator) {
      throw new SDKError(
        `Can't call execute on a contract . Function ${functionName} not found in contract descriptor.`
      );
    }
    return functionDecorator;
  }
}
