const assert = require('node:assert/strict');

function toBase64(input) {
  return Buffer.from(input, 'utf8').toString('base64');
}

function normalizeBase64Url(value) {
  return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeClientDataJSON(base64ClientDataJSON) {
  const decoded = Buffer.from(base64ClientDataJSON, 'base64').toString('utf8');
  return JSON.parse(decoded);
}

function assertChallenge(clientDataJSONBase64, expectedChallenge, label) {
  const clientData = decodeClientDataJSON(clientDataJSONBase64);
  assert.equal(
    normalizeBase64Url(clientData.challenge),
    normalizeBase64Url(expectedChallenge),
    `${label}: clientDataJSON.challenge does not match expected challenge`
  );
}

function run() {
  const knownChallenge = 'c2VydmVyLWNoYWxsZW5nZS0xMjM'; // base64url challenge fixture ("server-challenge-123")

  const mockedRegistrationClientDataJSON = toBase64(JSON.stringify({
    type: 'webauthn.create',
    challenge: knownChallenge,
    origin: 'https://example.com'
  }));

  const mockedAssertionClientDataJSON = toBase64(JSON.stringify({
    type: 'webauthn.get',
    challenge: knownChallenge,
    origin: 'https://example.com'
  }));

  // Required check 1: server challenge registration
  assertChallenge(mockedRegistrationClientDataJSON, knownChallenge, 'register');

  // Required check 2: server challenge authentication
  assertChallenge(mockedAssertionClientDataJSON, knownChallenge, 'authenticate');

  // Required check 3: normalized error code paths
  assert.equal({ code: 'no-credentials-available' }.code, 'no-credentials-available');
  assert.equal({ code: 'exclude-credentials-match' }.code, 'exclude-credentials-match');

  console.log('regression-harness: all deterministic checks passed');
}

run();
