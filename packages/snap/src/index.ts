import {
  OnTransactionHandler,
  OnTransactionResponse,
} from '@metamask/snap-types';
import { Transaction } from './utils';
import { contractCallDecoder } from './decoders/contract-call-decoder';
import { VerifiedStatus, verificationDecoder } from './decoders/verification';

/* eslint-enable camelcase */
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const result: OnTransactionResponse = {
    insights: {},
  };
  const tx = transaction as Transaction;

  const notice = await contractCallDecoder(tx);
  const verified = await verificationDecoder(tx);

  result.insights.notice = notice;
  if (verified === VerifiedStatus.NO_MATCH) {
    result.insights.verified = 'Sourcify 🔴 No Match';
  } else if (verified === VerifiedStatus.PARTIAL_MATCH) {
    result.insights.verified = 'Sourcify 🟡 Partial Match';
  } else if (verified === VerifiedStatus.FULL_MATCH) {
    result.insights.verified = 'Sourcify 🟢 Full Match';
  }

  return result;
};
