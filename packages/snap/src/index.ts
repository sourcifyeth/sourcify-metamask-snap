import {
  OnTransactionHandler,
  OnTransactionResponse,
} from '@metamask/snap-types';
import { Transaction } from './utils';
import { getNoticeInsight } from './insights/notice';
import { getVerificationInsight } from './insights/verification';

export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  return {
    insights: {
      ...(await getNoticeInsight(transaction as Transaction)),
      ...(await getVerificationInsight(transaction as Transaction)),
    },
  } as OnTransactionResponse;
};
