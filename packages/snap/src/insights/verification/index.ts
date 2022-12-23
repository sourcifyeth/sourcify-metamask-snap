/* eslint-disable no-bitwise */
import { arrayify, kekkak256, Transaction } from '../../utils';

enum VerificationInsight {
  FULL_MATCH = 'Sourcify 🟢 Full Match',
  PARTIAL_MATCH = 'Sourcify 🟡 Partial Match',
  NO_MATCH = 'Sourcify 🔴 No Match',
}

export const getVerificationInsight = async (
  transaction: Transaction,
): Promise<{ verified: VerificationInsight } | null> => {
  const chainId = wallet.networkVersion;
  const checksumAddress = await ethers.utils.getAddress(transaction.to);
  try {
    const res = await fetch(
      `https://repo.sourcify.dev/contracts/full_match/${chainId}/${checksumAddress}/metadata.json`,
    );
    if (res) {
      return { verified: VerificationInsight.FULL_MATCH };
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
      return { verified: VerificationInsight.PARTIAL_MATCH };
      }
    } catch (e) {
      console.log(e);
    }
  }

  return { verified: VerificationInsight.NO_MATCH };
};
