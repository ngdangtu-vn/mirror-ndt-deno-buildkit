import { hash_binary } from 'kit/hash.ts'

import { assertEquals } from 'test-runner'

/* ⦿ Public Fucntions */
const sample_message = 'Deno is @wesome!'

Deno.test(`pub:${hash_binary.name}`, async (t) => {
  await t.step('SHA-1 » generate CSP nonce', hash_binary_sha1)
  await t.step('SHA-256 » generate CSP hash', hash_binary_sha256)
  await t.step('SHA-384 » generate CSP hash', hash_binary_sha384)
  await t.step('SHA-512 » generate CSP hash', hash_binary_sha512)
})

async function hash_binary_sha1() {
  assertEquals(await hash_binary(sample_message, 'SHA-1'), 'h+AS0TqjTdMFcUNwGyfj/erpPog=')
}

async function hash_binary_sha256() {
  assertEquals(await hash_binary(sample_message, 'SHA-256'), 'iQ5z3fFEUAgz28jujQMxnvITD8yAnDkSsPCd0iMZ0vY=')
}

async function hash_binary_sha384() {
  assertEquals(await hash_binary(sample_message, 'SHA-384'), 'szAAuZXNvbDsrRkNiL7Opl2P6stkKadOybsYI1huAByvBbO3yJEWno4LSokUQ+yT')
}

async function hash_binary_sha512() {
  assertEquals(
    await hash_binary(sample_message, 'SHA-512'),
    'fUFRul6Tr2dOEOz5O3mVK2kcxwRXyKsd27iSlt1+dIsxwe67sIpXjinM4tkJUn0D4lv0ggX9z9c6OSehNpmNFA==',
  )
}
