const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

async function deriveKey(masterKey) {
  const imported = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(masterKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: textEncoder.encode('drivedb-salt-v1'),
      iterations: 200_000,
      hash: 'SHA-256',
    },
    imported,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

export async function encryptSecret(secret, masterKey) {
  if (!secret) {
    return '';
  }

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterKey);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    textEncoder.encode(secret)
  );

  return `${toBase64(iv)}.${toBase64(ciphertext)}`;
}

export async function decryptSecret(payload, masterKey) {
  if (!payload) {
    return '';
  }

  const [ivText, cipherText] = payload.split('.');
  const key = await deriveKey(masterKey);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromBase64(ivText) },
    key,
    fromBase64(cipherText)
  );

  return textDecoder.decode(plaintext);
}
