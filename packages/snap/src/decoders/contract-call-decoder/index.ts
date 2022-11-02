import { evaluateCallDataFromTx, MetadataSources } from 'contract-call-decoder';
import { Transaction } from '../../utils';

export const contractCallDecoder = async (
  tx: Transaction,
): Promise<any | null> => {
  return await evaluateCallDataFromTx(tx, {
    source: MetadataSources.BytecodeMetadata,
    rpcProvider: wallet,
  });
};
