// Hermes provides `btoa`; avoids a native module for encoding a few bytes
declare const btoa: (data: string) => string

export const fromByteArray = (bytes: Uint8Array): string => {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}
