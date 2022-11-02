/* eslint-disable no-bitwise */
import { arrayify, kekkak256, Transaction } from '../../utils';

export const getChecksumAddress = async (addr: string): Promise<string> => {
  const address = addr.toLowerCase();
  const chars = address.substring(2).split('');
  const hashed = arrayify(await kekkak256(chars.join('')));
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

export enum VerifiedStatus {
  NO_MATCH,
  PARTIAL_MATCH,
  FULL_MATCH,
}

export const getVerificationInsight = async (
  transaction: Transaction,
): Promise<any | null> => {
  const chainId = wallet.networkVersion;
  const checksumAddress = await getChecksumAddress(transaction.to);
  let verificationStatus = VerifiedStatus.NO_MATCH;
  try {
    const res = await fetch(
      `https://repo.sourcify.dev/contracts/full_match/${chainId}/${checksumAddress}/metadata.json`,
    );
    if (res) {
      verificationStatus = VerifiedStatus.FULL_MATCH;
    }
  } catch (e) {
    console.log(e);
  }

  if (verificationStatus === VerifiedStatus.NO_MATCH) {
    try {
      const res = await fetch(
        `https://repo.sourcify.dev/contracts/partial_match/${chainId}/${checksumAddress}/metadata.json`,
      );
      if (res) {
        verificationStatus = VerifiedStatus.PARTIAL_MATCH;
      }
    } catch (e) {
      console.log(e);
    }
  }

  let verified = '';
  if (verificationStatus === VerifiedStatus.NO_MATCH) {
    verified = 'Sourcify 🔴 No Match';
  } else if (verificationStatus === VerifiedStatus.PARTIAL_MATCH) {
    verified = 'Sourcify 🟡 Partial Match';
  } else if (verificationStatus === VerifiedStatus.FULL_MATCH) {
    verified = 'Sourcify 🟢 Full Match';
  }

  return { verified };
};
