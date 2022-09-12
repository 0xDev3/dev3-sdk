import {
  DeployableContract,
  FunctionParameter,
  EncodedFunctionParameter,
  EncodedFunctionParameterValue,
  EncodedFunctionOutput,
  ContractFunction,
} from '../types';
import { BigNumber } from 'bignumber.js';

export class MapperService {
  private static _instance?: MapperService;

  public static instance(): MapperService {
    if (!MapperService._instance) {
      MapperService._instance = new MapperService();
    }
    return MapperService._instance;
  }

  public encodeInputs(
    functionName: string,
    functionValues: any[],
    manifest: DeployableContract
  ): EncodedFunctionParameter[] {
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
      return (value as any[]).map((v) => {
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
          throw `MapperService:: Expected tuple definition but nothing found for decorator ${decorator.name} and function ${decorator.solidity_name}`;
        }
        return (value as any[]).map((v, i) => {
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
          return (value as any[]).map((v) => BigNumber(v));
        } else if (
          solidityType.startsWith('uint') ||
          solidityType.startsWith('int') ||
          solidityType.startsWith('byte')
        ) {
          return BigNumber(value);
        } else if (solidityType === 'address' || solidityType === 'string') {
          return String(value);
        } else {
          throw `MapperService:: Could not parse solidity type: ${solidityType} for function ${decorator.name}`;
        }
      }
    }
  }

  private getFunctionDecoratorFromManifest(
    functionName: string,
    contractDecorator: DeployableContract
  ): ContractFunction {
    const functionDecorator = contractDecorator.functions.find(
      (decorator) => decorator.solidity_name === functionName
    );
    if (!functionDecorator) {
      throw `MapperService:: Can't call execute on a contract . Function ${functionName} not found in contract descriptor.`;
    }
    return functionDecorator;
  }
}
