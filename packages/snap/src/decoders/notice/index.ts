// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import radspec from 'radspec';
import { Transaction } from '../../utils';

export const evaluate = async function (
  expression: any,
  abi: any,
  transaction: any,
): Promise<string> {
  const call = {
    abi,
    transaction,
  };
  return await radspec(expression, call);
};

export const noticeDecoder = async (
  tx: Transaction,
  metadata: any,
  selector: string,
): Promise<any | null> => {
  return await evaluate(
    metadata.output.userdoc.methods[selector || ''].notice,
    metadata.output.abi,
    tx,
  );
};
