import {
  _testonly,
  gen_cf_headers,
  HeaderList,
  load_cf_headers,
} from 'kit/cloudlfare/header.ts'

import { assertEquals, assertExists } from 'test-runner'

const { assemble_csp, assemble_hint, assemble_headers } = _testonly

// WARNING, TEST MUST BE RUNING FROM ROOT PROJECT
const file_sample = await load_cf_headers('test/cloudflare/headers.json')

/* ⦿ Public Fucntions */
Deno.test(`pub:${load_cf_headers.name}`, () => {
  const expect = JSON.parse(
    `{"/":{"Link":{"/main.css":{"rel":"preload","as":"style"},"/main.js":{"rel":"preload","as":"script"},"/res/bg.webp":{"rel":"preload","as":"image"},"/res/font.woff2":{"rel":"preload","as":"font","crossorigin":"anonymous"}},"Content-Security-Policy":{"connect-src":["cloudflareinsights.com"],"script-src":["'self'","static.cloudflareinsights.com","ajax.cloudflare.com","static.cloudflareinsights.com","https://challenges.cloudflare.com"],"style-src":["'self'"],"img-src":[""],"frame-src":["https://challenges.cloudflare.com"],"object-src":["'none'"],"base-uri":["'self'"],"require-trusted-types-for":["'script'"]}},"$schema":"https://schema.ngdangtu.dev/cloudflare-headers.json"}`,
  ) as HeaderList

  const msg_empty =
    'Either missing file or the function did not load file properly.'
  assertExists(file_sample, msg_empty)

  const msg_incorrect_content =
    'Loaded content is not match with expected content.'
  assertEquals(file_sample, expect, msg_incorrect_content)
})

Deno.test(`pub:${gen_cf_headers.name}`, async () => {
  const expect = await Deno.readTextFile('test/cloudflare/_headers')
  assertEquals(await assemble_headers(file_sample), expect)
})

/* ⦿ Private Fucntions */
// Deno.test(`prv:${assemble_route.name}`, () => {
//   // assertEquals(
//   //   await repo_root_path(),
//   //   new URL(import.meta.resolve('../')).pathname.slice(0, -1),
//   // )
// })

Deno.test(`prv:${assemble_hint.name}`, () => {
  const sample = { '/main.css': { 'rel': 'preload', 'as': 'style' } }
  const result = '</main.css>;rel="preload";as="style"'
  assertEquals(assemble_hint(sample), result)
})

Deno.test(`prv:${assemble_csp.name}`, async (t) => {
  await t.step('multiple source', assemble_csp_lots)
  await t.step('one source', assemble_csp_one)
  await t.step('empty directive', assemble_csp_empty)
})

async function assemble_csp_lots() {
  const sample = {
    'script-src': [
      '\'self\'',
      'static.cloudflareinsights.com',
      'ajax.cloudflare.com',
      'static.cloudflareinsights.com',
      'https://challenges.cloudflare.com',
    ],
  }
  const result =
    'script-src \'self\' static.cloudflareinsights.com ajax.cloudflare.com static.cloudflareinsights.com https://challenges.cloudflare.com'
  assertEquals(await assemble_csp(sample), result)
}

async function assemble_csp_one() {
  const sample = { 'style-src': ['\'self\''] }
  assertEquals(await assemble_csp(sample), 'style-src \'self\'')
}

async function assemble_csp_empty() {
  const sample_empty = { 'img-src': [] }
  const msg_empty = 'Empty array must return an empty string.'
  assertEquals(await assemble_csp(sample_empty), '', msg_empty)

  const sample_falsy_value = { 'img-src': [''] }
  const msg_falsy_value =
    'Array contains falsy only must return an empty string.'
  assertEquals(await assemble_csp(sample_falsy_value), '', msg_falsy_value)
}
