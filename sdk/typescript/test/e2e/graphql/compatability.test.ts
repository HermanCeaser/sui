// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { beforeAll, describe, expect, test } from 'vitest';

import { TransactionBlock } from '../../../src/builder';
import {
	getFullnodeUrl,
	SuiClient,
	SuiObjectData,
	SuiTransactionBlockResponse,
} from '../../../src/client';
import { publishPackage, setup, TestToolbox } from '../utils/setup';

describe('GraphQL SuiClient compatibility', () => {
	let toolbox: TestToolbox;
	let transactionBlockDigest: string;
	let packageId: string;
	let parentObjectId: string;

	beforeAll(async () => {
		toolbox = await setup({ rpcURL: 'http:127.0.0.1:9124' });

		const packagePath = __dirname + '/../data/dynamic_fields';
		({ packageId } = await publishPackage(packagePath, toolbox));

		await toolbox.client
			.getOwnedObjects({
				owner: toolbox.address(),
				options: { showType: true },
				filter: { StructType: `${packageId}::dynamic_fields_test::Test` },
			})
			.then(function (objects) {
				const data = objects.data[0].data as SuiObjectData;
				parentObjectId = data.objectId;
			});

		// create a simple transaction
		const txb = new TransactionBlock();
		const [coin] = txb.splitCoins(txb.gas, [1]);
		txb.transferObjects([coin], toolbox.address());
		const result = await toolbox.client.signAndExecuteTransactionBlock({
			transactionBlock: txb,
			signer: toolbox.keypair,
		});

		transactionBlockDigest = result.digest;

		await toolbox.client.waitForTransactionBlock({ digest: transactionBlockDigest });
	});

	test('getRpcApiVersion', async () => {
		const version = await toolbox.graphQLClient!.getRpcApiVersion();

		expect(version?.match(/^\d+.\d+.\d+$/)).not.toBeNull();
	});

	test('getCoins', async () => {
		const { data: rpcCoins } = await toolbox.client.getCoins({
			owner: toolbox.address(),
		});
		const { data: graphQLCoins } = await toolbox.graphQLClient!.getCoins({
			owner: toolbox.address(),
		});

		expect(graphQLCoins).toEqual(rpcCoins);
	});

	test('getAllCoins', async () => {
		const { data: rpcCoins } = await toolbox.client.getAllCoins({
			owner: toolbox.address(),
		});
		const { data: graphQLCoins } = await toolbox.graphQLClient!.getAllCoins({
			owner: toolbox.address(),
		});

		expect(graphQLCoins).toEqual(rpcCoins);
	});

	test('getBalance', async () => {
		const rpcCoins = await toolbox.client.getBalance({
			owner: toolbox.address(),
		});
		const graphQLCoins = await toolbox.graphQLClient!.getBalance({
			owner: toolbox.address(),
		});

		expect(graphQLCoins).toEqual(rpcCoins);
	});
	test('getBalance', async () => {
		const rpcBalance = await toolbox.client.getBalance({
			owner: toolbox.address(),
		});
		const graphQLBalance = await toolbox.graphQLClient!.getBalance({
			owner: toolbox.address(),
		});

		expect(graphQLBalance).toEqual(rpcBalance);
	});

	test('getAllBalances', async () => {
		const rpcBalances = await toolbox.client.getAllBalances({
			owner: toolbox.address(),
		});
		const graphQLBalances = await toolbox.graphQLClient!.getAllBalances({
			owner: toolbox.address(),
		});

		expect(graphQLBalances).toEqual(rpcBalances);
	});

	test('getCoinMetadata', async () => {
		const rpcMetadata = await toolbox.client.getCoinMetadata({
			coinType: '0x02::sui::SUI',
		});

		const graphQLMetadata = await toolbox.graphQLClient!.getCoinMetadata({
			coinType: '0x02::sui::SUI',
		});

		expect(graphQLMetadata).toEqual(rpcMetadata);
	});

	test('getTotalSupply', async () => {
		const rpcSupply = await toolbox.client.getTotalSupply({
			coinType: '0x02::sui::SUI',
		});

		const graphQLgetTotalSupply = await toolbox.graphQLClient!.getTotalSupply({
			coinType: '0x02::sui::SUI',
		});

		expect(graphQLgetTotalSupply).toEqual(rpcSupply);
	});

	test('getMoveFunctionArgTypes', async () => {
		const rpcMoveFunction = await toolbox.client.getMoveFunctionArgTypes({
			package: '0x02',
			module: 'coin',
			function: 'balance',
		});

		const graphQLMoveFunction = await toolbox.graphQLClient!.getMoveFunctionArgTypes({
			package: '0x02',
			module: 'coin',
			function: 'balance',
		});

		expect(graphQLMoveFunction).toEqual(rpcMoveFunction);
	});

	test('getNormalizedMoveFunction', async () => {
		const rpcMoveFunction = await toolbox.client.getNormalizedMoveFunction({
			package: '0x02',
			module: 'coin',
			function: 'balance',
		});

		const graphQLMoveFunction = await toolbox.graphQLClient!.getNormalizedMoveFunction({
			package: '0x02',
			module: 'coin',
			function: 'balance',
		});

		expect(graphQLMoveFunction).toEqual(rpcMoveFunction);
	});

	test('getNormalizedMoveModulesByPackage', async () => {
		const rpcMovePackage = await toolbox.client.getNormalizedMoveModulesByPackage({
			package: '0x02',
		});

		const graphQLMovePackage = await toolbox.graphQLClient!.getNormalizedMoveModulesByPackage({
			package: '0x02',
		});

		expect(graphQLMovePackage).toEqual(rpcMovePackage);
	});

	test('getNormalizedMoveModule', async () => {
		const rpcMoveModule = await toolbox.client.getNormalizedMoveModule({
			package: '0x02',
			module: 'coin',
		});

		const graphQLMoveModule = await toolbox.graphQLClient!.getNormalizedMoveModule({
			package: '0x02',
			module: 'coin',
		});

		expect(graphQLMoveModule).toEqual(rpcMoveModule);
	});

	test('getNormalizedMoveStruct', async () => {
		const rpcMoveStruct = await toolbox.client.getNormalizedMoveStruct({
			package: '0x02',
			module: 'coin',
			struct: 'Coin',
		});

		const graphQLMoveStruct = await toolbox.graphQLClient!.getNormalizedMoveStruct({
			package: '0x02',
			module: 'coin',
			struct: 'Coin',
		});

		expect(graphQLMoveStruct).toEqual(rpcMoveStruct);
	});

	test('getOwnedObjects', async () => {
		const { data: rpcObjects } = await toolbox.client.getOwnedObjects({
			owner: toolbox.address(),
			options: {
				showBcs: true,
				showContent: true,
				showDisplay: true,
				showOwner: true,
				showPreviousTransaction: true,
				showStorageRebate: true,
				showType: true,
			},
		});
		const { data: graphQLObjects } = await toolbox.graphQLClient!.getOwnedObjects({
			owner: toolbox.address(),
			options: {
				showBcs: true,
				showContent: true,
				showDisplay: true,
				showOwner: true,
				showPreviousTransaction: true,
				showStorageRebate: true,
				showType: true,
			},
		});

		expect(graphQLObjects).toEqual(rpcObjects);
	});

	test('getObject', async () => {
		const {
			data: [{ coinObjectId: id }],
		} = await toolbox.getGasObjectsOwnedByAddress();

		const rpcObject = await toolbox.client.getObject({
			id,
			options: {
				showBcs: true,
				showContent: true,
				showDisplay: true,
				showOwner: true,
				showPreviousTransaction: true,
				showStorageRebate: true,
				showType: true,
			},
		});
		const graphQLObject = await toolbox.graphQLClient!.getObject({
			id,
			options: {
				showBcs: true,
				showContent: true,
				showDisplay: true,
				showOwner: true,
				showPreviousTransaction: true,
				showStorageRebate: true,
				showType: true,
			},
		});

		expect(graphQLObject).toEqual(rpcObject);
	});

	test('tryGetPastObject', async () => {
		const {
			data: [{ coinObjectId: id, version }],
		} = await toolbox.getGasObjectsOwnedByAddress();
		const fullNodeClient = new SuiClient({
			url: getFullnodeUrl('localnet'),
		});

		const rpcObject = await fullNodeClient.tryGetPastObject({
			id,
			version: Number.parseInt(version, 10),
			options: {
				showBcs: true,
				showContent: true,
				showDisplay: true,
				showOwner: true,
				showPreviousTransaction: true,
				showStorageRebate: true,
				showType: true,
			},
		});
		const graphQLObject = await toolbox.graphQLClient!.tryGetPastObject({
			id,
			version: Number.parseInt(version, 10),
			options: {
				showBcs: true,
				showContent: true,
				showDisplay: true,
				showOwner: true,
				showPreviousTransaction: true,
				showStorageRebate: true,
				showType: true,
			},
		});

		expect(graphQLObject).toEqual(rpcObject);
	});

	test('multiGetObjects', async () => {
		const {
			data: [{ coinObjectId: id }],
		} = await toolbox.getGasObjectsOwnedByAddress();

		const rpcObjects = await toolbox.client.multiGetObjects({
			ids: [id],
			options: {
				showBcs: true,
				showContent: true,
				showDisplay: true,
				showOwner: true,
				showPreviousTransaction: true,
				showStorageRebate: true,
				showType: true,
			},
		});
		const graphQLObjects = await toolbox.graphQLClient!.multiGetObjects({
			ids: [id],
			options: {
				showBcs: true,
				showContent: true,
				showDisplay: true,
				showOwner: true,
				showPreviousTransaction: true,
				showStorageRebate: true,
				showType: true,
			},
		});

		expect(graphQLObjects).toEqual(rpcObjects);
	});

	test.skip('queryTransactionBlocks', async () => {
		const { nextCursor: _, ...rpcTransactions } = await toolbox.client.queryTransactionBlocks({
			filter: {
				FromAddress: toolbox.address(),
			},
			options: {
				showBalanceChanges: true,
				showEffects: true,
				showEvents: true,
				// TODO
				showInput: false,
				showObjectChanges: true,
				showRawInput: true,
			},
		});

		const { nextCursor: __, ...graphQLTransactions } =
			await toolbox.graphQLClient!.queryTransactionBlocks({
				filter: {
					FromAddress: toolbox.address(),
				},
				options: {
					showBalanceChanges: true,
					showEffects: true,
					showEvents: true,
					// TODO
					showInput: false,
					showObjectChanges: true,
					showRawInput: true,
				},
			});

		expect(graphQLTransactions).toEqual(rpcTransactions);
	});

	test.skip('getTransactionBlock', async () => {
		const rpcTransactionBlock = await toolbox.client.getTransactionBlock({
			digest: transactionBlockDigest,
			options: {
				showBalanceChanges: true,
				showEffects: true,
				showEvents: true,
				// TODO
				showInput: false,
				showObjectChanges: true,
				showRawInput: true,
			},
		});
		const graphQLTransactionBlock = await toolbox.graphQLClient!.getTransactionBlock({
			digest: transactionBlockDigest,
			options: {
				showBalanceChanges: true,
				showEffects: true,
				showEvents: true,
				// TODO
				showInput: false,
				showObjectChanges: true,
				showRawInput: true,
			},
		});

		expect(graphQLTransactionBlock).toEqual(rpcTransactionBlock);
	});

	test.skip('multiGetTransactionBlocks', async () => {
		const [rpcTransactionBlock] = await toolbox.client.multiGetTransactionBlocks({
			digests: [transactionBlockDigest],
			options: {
				showBalanceChanges: true,
				showEffects: true,
				showEvents: true,
				showInput: true,
				showObjectChanges: true,
				showRawInput: true,
			},
		});
		const [graphQLTransactionBlock] = await toolbox.graphQLClient!.multiGetTransactionBlocks({
			digests: [transactionBlockDigest],
			options: {
				showBalanceChanges: true,
				showEffects: true,
				showEvents: true,
				showInput: true,
				showObjectChanges: true,
				showRawInput: true,
			},
		});

		expect(graphQLTransactionBlock).toEqual(rpcTransactionBlock);
	});

	test('getTotalTransactionBlocks', async () => {
		const rpc = await toolbox.client.getTotalTransactionBlocks();
		const graphql = await toolbox.graphQLClient!.getTotalTransactionBlocks();

		expect(graphql).toEqual(rpc);
	});

	test('getReferenceGasPrice', async () => {
		const rpc = await toolbox.client.getReferenceGasPrice();
		const graphql = await toolbox.graphQLClient!.getReferenceGasPrice();

		expect(graphql).toEqual(rpc);
	});

	test('getStakes', async () => {
		const rpc = await toolbox.client.getStakes({
			owner: toolbox.address(),
		});
		const graphql = await toolbox.graphQLClient!.getStakes({
			owner: toolbox.address(),
		});

		expect(graphql).toEqual(rpc);
	});

	test.skip('getStakesById', async () => {
		// TODO: need to stake some coins first
		const stakes = await toolbox.client.getStakes({
			owner: toolbox.address(),
		});
		const rpc = await toolbox.client.getStakesByIds({
			stakedSuiIds: [stakes[0].stakes[0].stakedSuiId],
		});
		const graphql = await toolbox.graphQLClient!.getStakesByIds({
			stakedSuiIds: [stakes[0].stakes[0].stakedSuiId],
		});

		expect(graphql).toEqual(rpc);
	});

	test.skip('getLatestSuiSystemState', async () => {
		const rpc = await toolbox.client.getLatestSuiSystemState();
		const graphql = await toolbox.graphQLClient!.getLatestSuiSystemState();

		expect(graphql).toEqual(rpc);
	});

	test.skip('queryEvents', async () => {
		const { nextCursor: _, ...rpc } = await toolbox.client.queryEvents({
			query: {
				Package: '0x3',
			},
			limit: 1,
		});

		const { nextCursor: __, ...graphql } = await toolbox.graphQLClient!.queryEvents({
			query: {
				Package: '0x3',
			},
			limit: 1,
		});

		expect(graphql).toEqual(rpc);
	});

	test.skip('devInspectTransactionBlock', async () => {
		const txb = new TransactionBlock();
		txb.setSender(toolbox.address());
		const [coin] = txb.splitCoins(txb.gas, [1]);
		txb.transferObjects([coin], toolbox.address());

		const rpc = await toolbox.client.devInspectTransactionBlock({
			transactionBlock: txb,
			sender: toolbox.address(),
		});

		const graphql = await toolbox.graphQLClient!.devInspectTransactionBlock({
			transactionBlock: txb,
			sender: toolbox.address(),
		});

		expect(graphql).toEqual(rpc);
	});

	test.skip('getDynamicFields', async () => {
		const rpc = await toolbox.client.getDynamicFields({
			parentId: parentObjectId,
		});

		const graphql = await toolbox.graphQLClient!.getDynamicFields({
			parentId: parentObjectId,
		});

		expect(graphql).toEqual(rpc);
	});

	test.skip('getDynamicFieldObject', async () => {
		const {
			data: [field],
		} = await toolbox.client.getDynamicFields({
			parentId: parentObjectId,
			limit: 1,
		});

		const rpc = await toolbox.client.getDynamicFieldObject({
			parentId: parentObjectId,
			name: field.name,
		});

		const graphql = await toolbox.graphQLClient!.getDynamicFieldObject({
			parentId: parentObjectId,
			// TODO: name in RPC has encoded value, which we can't encoded to BCS consistently
			name: {
				type: field.name.type,
				value: field.bcsName,
			},
		});

		expect(graphql).toEqual(rpc);
	});

	test.skip('subscribeEvent', async () => {
		// TODO
	});

	test.skip('subscribeTransaction', async () => {
		// TODO
	});

	test.skip('executeTransactionBlock', async () => {
		const txb = new TransactionBlock();
		txb.setSender(toolbox.address());
		const [coin] = txb.splitCoins(txb.gas, [1]);
		txb.transferObjects([coin], toolbox.address());

		const { confirmedLocalExecution, ...graphql } =
			await toolbox.graphQLClient!.signAndExecuteTransactionBlock({
				transactionBlock: txb,
				signer: toolbox.keypair,
				options: {
					showBalanceChanges: true,
					showEffects: true,
					showEvents: true,
					// showInput: true,
					showObjectChanges: true,
					showRawInput: true,
				},
			});

		await toolbox.client.waitForTransactionBlock({ digest: graphql.digest });

		const { checkpoint, timestampMs, rawEffects, ...rpc } =
			(await toolbox.client.getTransactionBlock({
				digest: graphql.digest,
				options: {
					showBalanceChanges: true,
					showEffects: true,
					showEvents: true,
					// showInput: true,
					showObjectChanges: true,
					showRawInput: true,
				},
			})) as SuiTransactionBlockResponse & { rawEffects: unknown };

		// Deleted gas coin isn't included in changes when executing transaction block
		rpc.objectChanges?.pop();

		expect(graphql).toEqual(rpc);
	});

	test.skip('dryRunTransactionBlock', async () => {
		const txb = new TransactionBlock();
		txb.setSender(toolbox.address());
		const [coin] = txb.splitCoins(txb.gas, [1]);
		txb.transferObjects([coin], toolbox.address());
		const bytes = await txb.build({ client: toolbox.client });

		const rpc = await toolbox.client.dryRunTransactionBlock({
			transactionBlock: bytes,
		});

		const graphql = await toolbox.graphQLClient!.dryRunTransactionBlock({
			transactionBlock: bytes,
		});

		expect(graphql).toEqual(rpc);
	});

	test('getLatestCheckpointSequenceNumber', async () => {
		const rpc = await toolbox.client.getLatestCheckpointSequenceNumber();
		const graphql = await toolbox.graphQLClient!.getLatestCheckpointSequenceNumber();

		expect(graphql).toEqual(rpc);
	});

	test('getCheckpoint', async () => {
		const rpc = await toolbox.client.getCheckpoint({
			id: '3',
		});
		const graphql = await toolbox.graphQLClient!.getCheckpoint({
			id: '3',
		});

		expect(graphql).toEqual(rpc);
	});

	test('getCheckpoints', async () => {
		const { data: rpc } = await toolbox.client.getCheckpoints({
			descendingOrder: false,
			limit: 5,
		});
		const { data: graphql } = await toolbox.graphQLClient!.getCheckpoints({
			descendingOrder: false,
			limit: 5,
		});

		expect(graphql).toEqual(rpc);
	});

	test.skip('getCommitteeInfo', async () => {
		const rpc = await toolbox.client.getCommitteeInfo({});
		const graphql = await toolbox.graphQLClient!.getCommitteeInfo({});

		expect(graphql).toEqual(rpc);
	});

	test.skip('getNetworkMetrics', async () => {
		const rpc = await toolbox.client.getNetworkMetrics();
		const graphql = await toolbox.graphQLClient!.getNetworkMetrics();

		expect(graphql).toEqual(rpc);
	});

	test.skip('getMoveCallMetrics', async () => {
		const rpc = await toolbox.client.getMoveCallMetrics();
		const graphql = await toolbox.graphQLClient!.getMoveCallMetrics();

		expect(graphql).toEqual(rpc);
	});

	test.skip('getAddressMetrics', async () => {
		const rpc = await toolbox.client.getAddressMetrics();
		const graphql = await toolbox.graphQLClient!.getAddressMetrics();

		expect(graphql).toEqual(rpc);
	});

	test.skip('getAllEpochAddressMetrics', async () => {
		const rpc = await toolbox.client.getAllEpochAddressMetrics();
		const graphql = await toolbox.graphQLClient!.getAllEpochAddressMetrics();

		expect(graphql).toEqual(rpc);
	});

	test.skip('getEpochs', async () => {
		const rpc = await toolbox.client.getEpochs();
		const graphql = await toolbox.graphQLClient!.getEpochs();

		expect(graphql).toEqual(rpc);
	});

	test.skip('getCurrentEpoch', async () => {
		const rpc = await toolbox.client.getCurrentEpoch();
		const graphql = await toolbox.graphQLClient!.getCurrentEpoch();

		expect(graphql).toEqual(rpc);
	});

	test('getValidatorsApy', async () => {
		const rpc = await toolbox.client.getValidatorsApy();
		const graphql = await toolbox.graphQLClient!.getValidatorsApy();

		for (let i = 0; i < rpc.apys.length; i++) {
			expect(graphql.apys[i].address).toEqual(rpc.apys[i].address);
		}
	});

	test('getChainIdentifier', async () => {
		const rpc = await toolbox.client.getChainIdentifier();
		const graphql = await toolbox.graphQLClient!.getChainIdentifier();

		expect(graphql).toEqual(rpc);
	});

	test('getProtocolConfig', async () => {
		const rpc = await toolbox.client.getProtocolConfig();
		const graphql = await toolbox.graphQLClient!.getProtocolConfig();

		expect(graphql).toEqual(rpc);
	});

	test('resolveNameServiceAddress', async () => {
		const rpc = await toolbox.client.resolveNameServiceAddress({
			name: 'test.sui',
		});
		const graphql = await toolbox.graphQLClient!.resolveNameServiceAddress({
			name: 'test.sui',
		});

		expect(graphql).toEqual(rpc);
	});

	test('resolveNameServiceNames', async () => {
		const rpc = await toolbox.client.resolveNameServiceNames({
			address: toolbox.address(),
		});
		const graphql = await toolbox.graphQLClient!.resolveNameServiceNames({
			address: toolbox.address(),
		});

		expect(graphql).toEqual(rpc);
	});
});
