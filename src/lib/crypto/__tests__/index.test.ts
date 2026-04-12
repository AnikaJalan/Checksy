import { describe, it, expect } from 'vitest';
import { encryptKey, decryptKey } from '../index';

describe('Crypto module', () => {
  it('should cleanly encrypt and decrypt text', () => {
    const plainText = 'sk-test-12345';
    const encrypted = encryptKey(plainText);
    
    expect(encrypted.encryptedKey).toBeTypeOf('string');
    expect(encrypted.iv).toBeTypeOf('string');
    expect(encrypted.authTag).toBeTypeOf('string');
    expect(encrypted.encryptedKey).not.toBe(plainText);
    
    const decrypted = decryptKey(encrypted.encryptedKey, encrypted.iv, encrypted.authTag);
    expect(decrypted).toBe(plainText);
  });

  it('should fail to decrypt with wrong authTag', () => {
    const plainText = 'sk-test-12345';
    const encrypted = encryptKey(plainText);
    
    expect(() => {
      decryptKey(encrypted.encryptedKey, encrypted.iv, '00000000000000000000000000000000');
    }).toThrow();
  });
});
