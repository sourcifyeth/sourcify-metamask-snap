import { kekkak256, Transaction } from '../../utils';

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

export const findSelectorItemFromSignatureHash = async (
  functionSignatureHash: any,
  abi: any,
): Promise<string> => {
  for (const el of abi) {
    if (el.type === 'function') {
      const functionSelector = getFunctionSelectorFromAbi(el);
      const functionSignatureRaw = await kekkak256(functionSelector);
      const functionSignature = `0x${functionSignatureRaw.slice(0, 8)}`;

      if (functionSignature === functionSignatureHash) {
        return functionSelector;
      }
    }
  }
  return '';
};

export const selectorDecoder = async (
  tx: Transaction,
  metadata: any,
): Promise<any | null> => {
  const functionSignatureHash = tx.data.slice(2, 10);

  return await findSelectorItemFromSignatureHash(
    `0x${functionSignatureHash}`,
    metadata.output.abi,
  );
};
