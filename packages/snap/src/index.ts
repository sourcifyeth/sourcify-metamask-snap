import { decode as cborDecode } from 'cbor-x';
import bs58 from 'bs58';
import { OnTransactionHandler } from '@metamask/snap-types';
import { decode } from '@metamask/abi-utils';
import {
  evaluate,
  getChecksumAddress,
  findSelectorItemFromSignatureHash,
  normalizeAbiValue,
  VerifiedStatus,
} from './utils';

/* eslint-enable camelcase */
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  const insights: { notice: string; parameters: any[]; verified: string } = {
    verified: '',
    notice: '',
    parameters: [],
  };
  const tx = transaction as {
    data: string;
    to: string;
  };

  const chainId = wallet.networkVersion;

  const bytecodeRaw = await wallet?.request({
    method: 'eth_getCode',
    params: [tx.to],
  });

  if (bytecodeRaw === null || bytecodeRaw === undefined) {
    return { insights };
  }

  const bytecode = bytecodeRaw.toString();

  const ipfsHashLength = parseInt(`${bytecode.slice(-4)}`, 16);
  const cborEncoded = bytecode.substring(
    bytecode.length - 4 - ipfsHashLength * 2,
    bytecode.length - 4,
  );

  const contractMetadata = cborDecode(Buffer.from(cborEncoded, 'hex'));

  let contractMetadataJSON: any;
  try {
    const req = await fetch(
      `https://ipfs.io/ipfs/${bs58.encode(contractMetadata.ipfs)}`,
    );
    contractMetadataJSON = await req.json();
  } catch (e) {
    console.log(e);
    return { insights };
  }

  const metadata = contractMetadataJSON;

  const functionSignatureHash = tx.data.slice(2, 10);

  const selector = await findSelectorItemFromSignatureHash(
    `0x${functionSignatureHash}`,
    metadata.output.abi,
  );

  const notice = await evaluate(
    metadata.output.userdoc.methods[selector || ''].notice,
    metadata.output.abi,
    tx,
  );

  insights.notice = notice;

  const parameterTypes = selector
    .slice(selector.indexOf('(') + 1, selector.indexOf(')'))
    .split(',');

  const decodedParameters = decode(parameterTypes, `0x${tx.data.slice(10)}`);

  insights.parameters = decodedParameters.map(normalizeAbiValue);

  const checksumAddress = await getChecksumAddress(tx.to);
  let verified = VerifiedStatus.NO_MATCH;
  try {
    const res = await fetch(
      `https://repo.sourcify.dev/contracts/full_match/${chainId}/${checksumAddress}/metadata.json`,
    );
    if (res) {
      verified = VerifiedStatus.FULL_MATCH;
    }
  } catch (e) {
    console.log(e);
  }

  if (verified === VerifiedStatus.NO_MATCH) {
    try {
      const res = await fetch(
        `https://repo.sourcify.dev/contracts/partial_match/${chainId}/${checksumAddress}/metadata.json`,
      );
      if (res) {
        verified = VerifiedStatus.PARTIAL_MATCH;
      }
    } catch (e) {
      console.log(e);
    }
  }

  if (verified === VerifiedStatus.NO_MATCH) {
    insights.verified = '🔴 No Match';
  } else if (verified === VerifiedStatus.PARTIAL_MATCH) {
    insights.verified = '🟡 Partial Match';
  } else if (verified === VerifiedStatus.FULL_MATCH) {
    insights.verified = '🟢 Full Match';
  }

  return { insights };
};
