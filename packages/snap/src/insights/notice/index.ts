import { evaluateCallDataFromTx, MetadataSources } from 'contract-call-decoder';
import { Transaction } from '../../utils';

export const getNoticeInsight = async (
  transaction: Transaction,
): Promise<any | null> => {
  const notice = await evaluateCallDataFromTx(transaction, {
    source: MetadataSources.BytecodeMetadata,
    rpcProvider: wallet,
  });
  return { notice };
};
