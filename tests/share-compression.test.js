import { test } from 'node:test';
import assert from 'node:assert';
import { encodeBoardToUrlHash, decodeBoardFromUrlHash } from '../src/utils/share.ts';

const USER_LEGACY_HASH = 'N4IgLiBcIEoPYGMDWAyAsgUzAQwDYgBoQAnKAbVAEspxKNiBaAZ0JH2gGVWEaBiAMwDMADgBG2YawC25ALoBfAlRpg6jbK3YgAgtz79sokQHZpcxcuir6DUZpoAhPdAEBODACZs-M5DIKlEGorNQYeIi0AYWcQXmwANgxBbABGX38LIJVQgBN7aAARGN5hV1EAFgN0gMtaGx8ImgAxYoRxeP5TIhk-BVkiAFdyILAMKQYU41cPQUFy8oAGFPjXVwZXOBz8IkpR8cnp2fmllbWBgE9ygAtWXbGJqZm5xeXVhhx4gDtbvYfD55Ob1cUiu1B2vwOT2OrzWwkoAFZ4T97pCji9TgwAFbCc5dEYox5owFrACOAwW5WR+0JAJhDDgVyQAHcqX8oei3gAHFKcjCs1G0jGc7Bk-k06EYgDmAA9sCxwQT-hK3nMQWKlRy1nBPqIbgrqRriQxpdLJXl9WyiXSKgMGviDeyjZzRPEAF7qx10lIIAZpC0C5VrJnYSiU-3izUMSjLGThw10gBu0tESA9VoxlFwcD99stgremPh5Rzdwd6be5WlpTT+bWomInzgNcDDE+SFdHmbkdwmKYeNLeZbcDAcEkcc9GIGSZZ4-Layk0tdkq7TuM5UxK7pxFd8Q3s9rDGMcAqm4xCbACz5+5b0eIetzAcj2ExuHND4jRoT534y+vkakrifG+A6PkaOTxAM3x-kaUg7oIp5vAg-BXMBEIftawjSnaIHoRiJIeMInIIWsxBGPK77xkKUjwp20F0kwog5KhioTm8ogLMYv4UaxQYkvw5zEQw8JIFcpB0RirhgFIaT9CAqZ+LUOGUUCmzbCAAlWBg0oQEQEDQPAyAAASfAA5IZ8C4GpPAuG0CSdCAmTBNxc4MHCiKsBp4BaTp4COLgAwYEw5mIKmRDWbEtkdKYjk0EpPFYjieKeaM2msHpIAAApMOcCBXBgOQYLglAIMFyCtO09kxdAcUuWSFIeSo3lpc0cC4EgpWhSA4W8JFlWBE5NUHgyzINZpqW6TQHBwAMYB5Q2HXlXZ0X9bFaHKWclz3slTUTdAAAS2DEDkC1hXwvXLYpa3xcCoKjV542+ZwcD8GAJ1dWdFUXVk1VXS53K8ndKU+elGXEHAkpvd150OStP0sX9IpDEQ20PelAByGBMoZADq2AJle702Z9MOXfDB4ynKgM7Y9mWQe1BmdVDxNVc5B6qltjWozQB1HQgcDEBghkZXTi1RST32s0OOoc2NwM0BlcBMK9wttqLfWk2WB4fFB6mc3LnBINgQsi6dRNLeLA2-QeJpmlTXPQArnIMCrjMfebLODS2Np2ij+sgA4xC7JycBEabEXM7DkuRs6bp237ADih3YJKgsM+ZGAJpQCZ4GrX2W2TLber6cfNfpIWGQAop8ldMMKjZWW7Yse1bLbBqGJe7SA8e4NgUgdYZAD0hmYDgDdm03kee5G0bxLGuuy6XIAV1IcCGQAFCkSsDx4QE43jGAAJS5xbq0F5GSYph3NPL6va+CEdA-lLNe-40fYc9RHGuDtPWY5r7i8KyVoZHmOQ+YC2Ps3M+RpCzFivuleOw4rjDywDnd+0NIGaxbJWasyM9aLwKHAOAfcR6oMJuHd2k8W6RnrI2OBNB47EEginCBlCoF0jbB2OhDtFZgAYAwphgsh4OBmq9BmLCv6gTpD2PsXCQB7QwHjc4yDR7iIllPI0w5RyyIACqiTlEgkhY9yETwkbhN4U5pQznnvdP2CsmT0GUaQpmFDTHrQYAuJcsiOAjk+A4oeHB-I5BTo4oxH8XFqKoaudcsiGGEPxiE1R+dMGRm3LuWRBQFHP0MYk0+ySjRHhPLghencHA9yMtktBn8IlsLPBeAm-9O4AEkgIDCVoHPACTKnhKSd-I0t4ZY2MXmjAYnSyFhJMdUvJdJnyvlkYYsBBNnETJ6ZIs834uINJphk7As0FmD0Mg4TJOQ4BMmriAhZOS4ZTIxABICsjQbgxCfsgomIMCfFekPNAOzRIhUuVHMCEEdabPShwc4UhORXG1MVUZSz1aTN6XSWC8R4JFMGZ3JorV2oVLGeg1h1zELITfMCyakKMCSmwK6RZjc4UrLMXWTCPs8Gd0dv3Ne8QFhMDfjiqptK3H4UIvckOrLjAcq5bCvOuSEUYlIoIcixLuGclZcIUVfz1F0k5NRWi1igYAKFWnNergVVdOWZK1ZbwGJMUFYq-VHgFh2s5aqyJ1oOIbKZTTFlNqlhGu5d001dKGBMj4gJVFOrmV6vLmvW1tqHXGppX6txwlRKyO0LgUYDYdlZ1Tr82NEqrlSqBFJP+br0oprTZ8DN8TsXiocgoIAA';

test('Verify backward compatibility: decodes user legacy hash accurately', () => {
  const board = decodeBoardFromUrlHash(USER_LEGACY_HASH);
  assert.ok(board !== null, 'Legacy hash must decode without error');
  assert.strictEqual(board.title, 'Rock&Metal');
  assert.strictEqual(board.unrankedItemIds.length, 49);
  assert.strictEqual(Object.keys(board.items).length, 49);
  assert.strictEqual(board.items[board.unrankedItemIds[0]].title, "Rock n' Roll");
});

test('Verify v2 encoding is at least 70% smaller than legacy hash', () => {
  const board = decodeBoardFromUrlHash(USER_LEGACY_HASH);
  assert.ok(board !== null);

  const newHash = encodeBoardToUrlHash(board);
  assert.ok(newHash.startsWith('v2.'), 'Must use v2 prefix');
  assert.ok(
    newHash.length <= 550,
    `New hash (${newHash.length} chars) must be under 550 chars (down from ${USER_LEGACY_HASH.length})`
  );

  const decoded = decodeBoardFromUrlHash(newHash);
  assert.ok(decoded !== null, 'v2 hash must decode without error');
  assert.strictEqual(decoded.title, 'Rock&Metal');
  assert.strictEqual(decoded.unrankedItemIds.length, 49);
  assert.strictEqual(Object.keys(decoded.items).length, 49);
  assert.strictEqual(decoded.items[decoded.unrankedItemIds[0]].title, "Rock n' Roll");
});
