// import { MapperService } from '../../src';
// import { DeployableContract } from '../../src/core/types';

// describe('Mapper Service tests', function () {
//     it('test basic scenarios when mapping function parameters', async () => {
//         const functionName = 'test_fn';
//         const contract: DeployableContract = {
//             id: 'test-id',
//             tags: ['tag'],
//             implements: ['interface'],
//             binary: '0x',
//             constructors: [],
//             functions: [
//                 {
//                     name: 'Test Fn',
//                     description: 'test function description',
//                     solidity_name: 'test_fn',
//                     inputs: [
//                         {
//                             name: 'Param 1',
//                             description: 'Param 1 description',
//                             solidity_name: 'param1',
//                             solidity_type: 'uint256',
//                             recommended_types: []
//                         },
//                         {
//                             name: 'Param 2',
//                             description: 'Param 2 description',
//                             solidity_name: 'param2',
//                             solidity_type: 'tuple[][]',
//                             parameters: [
//                                 {
//                                     name: 'Param 2 - 1',
//                                     description: 'Param 2 - 1 description',
//                                     solidity_name: 'param21',
//                                     solidity_type: 'bool[]',
//                                     recommended_types: []
//                                 },
//                                 {
//                                     name: 'Param 2 - 2',
//                                     description: 'Param 2 - 2 description',
//                                     solidity_name: 'param22',
//                                     solidity_type: 'tuple[3]',
//                                     parameters: [
//                                         {
//                                             name: "Param 2 - 2 - 1",
//                                             description: "Param 2 - 2 - 1 description",
//                                             solidity_name: 'param221',
//                                             solidity_type: 'bytes',
//                                             recommended_types: []
//                                         },
//                                         {
//                                             name: "Param 2 - 2 - 2",
//                                             description: "Param 2 - 2 - 2 description",
//                                             solidity_name: 'param222',
//                                             solidity_type: 'uint16[]',
//                                             recommended_types: []
//                                         },
//                                         {
//                                             name: "Param 2 - 2 - 3",
//                                             description: "Param 2 - 2 - 3 description",
//                                             solidity_name: 'param223',
//                                             solidity_type: 'string',
//                                             recommended_types: []
//                                         },
//                                     ],
//                                     recommended_types: []
//                                 }
//                             ],
//                             recommended_types: []
//                         }
//                     ],
//                     outputs: [
//                         {
//                             name: 'Test output',
//                             description: 'Test description',
//                             solidity_name: '',
//                             solidity_type: 'tuple[]',
//                             recommended_types: [],
//                             parameters: [
//                                 {
//                                     name: 'Struct.Param1',
//                                     description: 'struct param 1 desc',
//                                     solidity_name: '',
//                                     solidity_type: 'address',
//                                     recommended_types: [],
//                                 },
//                                 {
//                                     name: 'Struct.Param2',
//                                     description: 'struct param 2 desc',
//                                     solidity_name: '',
//                                     solidity_type: 'uint256',
//                                     recommended_types: [],
//                                 },
//                                 {
//                                     name: 'Struct.Param3',
//                                     description: 'struct param 3 desc',
//                                     solidity_name: '',
//                                     solidity_type: 'uint256',
//                                     recommended_types: [],
//                                 }
//                             ]
//                         }
//                     ],
//                     emittable_events: [],
//                     read_only: false
//                 }
//             ],
//             events: []
//         };

//         const strct = [
//             [true, false, false, true, true],
//             [
//                 [ [], [],   "yolo" ],
//                 [ [], [42], "xyz" ],
//                 [ [], [],   "test" ]
//             ]
//         ];
//         const input = [
//             420,
//             [
//                 [strct, strct, strct],
//                 [strct, strct],
//                 [strct],
//             ]
//         ];
//         // console.dir(
//         //     MapperService.instance().encodeInputs(
//         //         functionName,
//         //         input,
//         //         contract
//         //     ),
//         //     { depth: null }
//         // );

//         console.dir(
//             MapperService.instance().encodeOutputTypes(functionName, contract)
//         );
//     });
// });
