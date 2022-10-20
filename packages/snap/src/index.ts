import { OnTransactionHandler } from '@metamask/snap-types';
import { Insights, Transaction } from './utils';
import { metadataDecoder } from './decoders/metadata';
import { selectorDecoder } from './decoders/selector';
import { noticeDecoder } from './decoders/notice';
import { parametersDecoder } from './decoders/parameters';
import { VerifiedStatus, verificationDecoder } from './decoders/verification';

/* eslint-enable camelcase */
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const insights: Insights = {
    verified: '',
    notice: '',
    parameters: [],
  };
  const tx = transaction as Transaction;

  const metadata = await metadataDecoder(tx);
  const selector = await selectorDecoder(tx, metadata);
  const notice = await noticeDecoder(tx, metadata, selector);
  const parameters = await parametersDecoder(tx, selector);
  const verified = await verificationDecoder(tx);

  insights.notice = notice;
  insights.parameters = parameters;
  if (verified === VerifiedStatus.NO_MATCH) {
    insights.verified = 'Sourcify 🔴 No Match';
  } else if (verified === VerifiedStatus.PARTIAL_MATCH) {
    insights.verified = 'Sourcify 🟡 Partial Match';
  } else if (verified === VerifiedStatus.FULL_MATCH) {
    insights.verified = 'Sourcify 🟢 Full Match';
  }

  return { insights };
};
