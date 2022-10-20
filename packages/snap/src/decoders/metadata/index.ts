import { decode as cborDecode } from 'cbor-x';
import bs58 from 'bs58';
import { Transaction } from '../../utils';

export const metadataDecoder = async (tx: Transaction): Promise<any | null> => {
  const bytecodeRaw = await wallet?.request({
    method: 'eth_getCode',
    params: [tx.to],
  });

  if (bytecodeRaw === null || bytecodeRaw === undefined) {
    return null;
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
    return null;
  }

  return contractMetadataJSON;
};
