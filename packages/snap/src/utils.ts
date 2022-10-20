import { Keccak } from 'sha3';

export const kekkak256 = async (message: string) => {
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

export type Insights = {
  notice: string;
  parameters: any[];
  verified: string;
};

export type Transaction = {
  data: string;
  to: string;
};
