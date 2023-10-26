/**
 * @reference
 * - https://content-security-policy.com/hash
 * - https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
 * - https://stackoverflow.com/a/9458996
 */
export async function hash_binary(
  message: string,
  algorithm: AlgorithmIdentifier = "SHA-512",
): Promise<string> {
  const msg_uint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hash_buffer = await crypto.subtle.digest(algorithm, msg_uint8); // hash the message
  const hash_array = Array.from(new Uint8Array(hash_buffer)); // convert buffer to byte array
  const hash_hex = hash_array
    .map((b) => String.fromCharCode(b))
    .join(""); // convert bytes to hex string
  return btoa(hash_hex);
}
