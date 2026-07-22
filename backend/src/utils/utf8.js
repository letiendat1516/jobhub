import path from 'node:path';

const hasReplacementCharacter = (value) => value.includes('\uFFFD');

/**
 * Multer/Busboy can expose UTF-8 multipart filenames as Latin-1 text.
 * Decode only when every character can represent a raw byte and the
 * conversion is lossless; already-correct Unicode is left untouched.
 */
const repairLatin1DecodedUtf8 = (value) => {
  const text = String(value ?? '').normalize('NFC');
  if (!text || [...text].some((character) => character.codePointAt(0) > 255)) {
    return text;
  }

  const decoded = Buffer.from(text, 'latin1').toString('utf8');
  return hasReplacementCharacter(decoded) ? text : decoded.normalize('NFC');
};

const normalizeUploadFilename = (value) => {
  const repaired = repairLatin1DecodedUtf8(value);
  const basename = path.basename(repaired.replaceAll('\\', '/'));
  return [...basename]
    .filter((character) => {
      const code = character.codePointAt(0);
      return code >= 32 && code !== 127;
    })
    .join('')
    .trim();
};

export { normalizeUploadFilename, repairLatin1DecodedUtf8 };
