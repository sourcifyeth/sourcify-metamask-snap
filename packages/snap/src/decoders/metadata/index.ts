import { decode } from '@marcocastignoli/bytecode-utils';
import { Transaction } from '../../utils';

export const metadataDecoder = async (tx: Transaction): Promise<any | null> => {
  const bytecodeRaw = await wallet?.request({
    method: 'eth_getCode',
    params: [tx.to],
  });

  if (bytecodeRaw === null || bytecodeRaw === undefined) {
    return null;
  }

  const decodedObject = decode(bytecodeRaw as string);
  if (!decodedObject.ipfs) {
    return null;
  }

  let contractMetadataJSON: any;
  try {
    const req = await fetch(`https://ipfs.io/ipfs/${decodedObject.ipfs}`);
    contractMetadataJSON = await req.json();
  } catch (e) {
    console.log(e);
    return null;
  }

  return contractMetadataJSON;
};
