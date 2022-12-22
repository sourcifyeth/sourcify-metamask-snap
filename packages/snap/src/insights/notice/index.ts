import {
  decodeContractCall,
  MetadataSources,
} from '@ethereum-sourcify/contract-call-decoder';
import { Transaction } from '../../utils';

export const getNoticeInsight = async (
  transaction: Transaction,
): Promise<any | null> => {
  const response = await decodeContractCall(transaction, {
    source: MetadataSources.BytecodeMetadata,
    rpcProvider: wallet,
  });
  if (!response) {
    return { notice: '' };
  }
  return {
    Author: response.contract.author || '',
    Title: response.contract.title || '',
    'Contract details': response.contract.details || '',
    Selector: response.method.selector || '',
    Details: response.method.details || '',
    Returns: response.method.returns || '',
    Notice: response.method.notice || '',
  };
};
