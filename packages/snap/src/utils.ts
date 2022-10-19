/* eslint-disable no-bitwise */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import radspec from 'radspec';
import { Keccak } from 'sha3';
import { Json, bytesToHex } from '@metamask/utils';

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

export const handleComponents = (input: {
  type: string;
  components: any[];
}): string => {
  if (input.type === 'tuple') {
    return `(${input.components.map((c) => handleComponents(c)).join(',')})`;
  } else if (input.type === 'tuple[]') {
    return `(${input.components.map((c) => handleComponents(c)).join(',')})[]`;
  }
  return input.type;
};

export const getFunctionSelectorFromAbi = (abi: any): string => {
  const types = abi.inputs.map((i: any) => handleComponents(i));
  return `${abi.name}(${types.join(',')})`;
};

export const digestMessage = async (message: string) => {
  const hash = new Keccak(256);
  hash.update(message);
  return hash.digest('hex');
};

export const arrayify = (hex: string): number[] => {
  const result = [];
  for (let i = 0; i < hex.length; i += 2) {
    result.push(parseInt(hex.substring(i, i + 2), 16));
  }
  return result;
};

export const getChecksumAddress = async (addr: string): Promise<string> => {
  const address = addr.toLowerCase();
  const chars = address.substring(2).split('');
  const hashed = arrayify(await digestMessage(chars.join('')));
  for (let i = 0; i < 40; i += 2) {
    if (hashed[i >> 1] >> 4 >= 8) {
      chars[i] = chars[i].toUpperCase();
    }

    if ((hashed[i >> 1] & 0x0f) >= 8) {
      chars[i + 1] = chars[i + 1].toUpperCase();
    }
  }
  return `0x${chars.join('')}`;
};

export const findSelectorItemFromSignatureHash = async (
  functionSignatureHash: any,
  abi: any,
): Promise<string> => {
  for (const el of abi) {
    if (el.type === 'function') {
      const functionSelector = getFunctionSelectorFromAbi(el);
      const functionSignatureRaw = await digestMessage(functionSelector);
      const functionSignature = `0x${functionSignatureRaw.slice(0, 8)}`;

      if (functionSignature === functionSignatureHash) {
        return functionSelector;
      }
    }
  }
  return '';
};

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

export enum VerifiedStatus {
  NO_MATCH,
  PARTIAL_MATCH,
  FULL_MATCH,
}
