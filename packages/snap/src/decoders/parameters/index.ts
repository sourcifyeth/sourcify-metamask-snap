// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Json, bytesToHex } from '@metamask/utils';
import { decode } from '@metamask/abi-utils';
import { Transaction } from '../../utils';

export const normalizeAbiValue = (value: unknown): Json => {
  if (Array.isArray(value)) {
    return value.map(normalizeAbiValue);
  }

  if (value instanceof Uint8Array) {
    return bytesToHex(value);
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  return value as Json;
};

export const parametersDecoder = async (
  tx: Transaction,
  selector: string,
): Promise<any | null> => {
  const parameterTypes = selector
    .slice(selector.indexOf('(') + 1, selector.indexOf(')'))
    .split(',');

  const decodedParameters = decode(parameterTypes, `0x${tx.data.slice(10)}`);

  return decodedParameters.map(normalizeAbiValue);
};
