import setup_path, { _testonly } from 'kit/path.ts'

import { assertEquals, assertGreater, assertLess } from 'test-runner'
import { resolve } from 'https://deno.land/std@0.204.0/path/resolve.ts'

const { root, repo_root_path } = _testonly

/* ⦿ Public Fucntions */
const { base, src } = setup_path({ src: 'src' })

Deno.test(`pub:${setup_path.name}`, async (t) => {
  await t.step('base() resolve path at root', setup_path_base)
  await t.step('src() resolve path at root/src', setup_path_custom_path)
})

function setup_path_base() {
  const msg_empty = 'No param means get root path :)'
  assertEquals(base(), root, msg_empty)

  const msg_goout =
    'Go up 1 level, so actual path must be shorter than expect path.'
  assertLess(base('..'), root, msg_goout)

  const msg_goin =
    'Go in 1 child, so actual path must be longer than expect path'
  assertGreater(base('child'), root, msg_goin)
}

function setup_path_custom_path() {
  const src_dir = resolve(root!, 'src')

  const msg_empty = 'No param means get src path :)'
  assertEquals(src(), src_dir, msg_empty)

  const msg_goout = 'Go up 1 level means from root/src/ go to root/.'
  assertEquals(src('..'), root, msg_goout)

  const msg_goin =
    'Go in 1 child, so actual path must be longer than expect path'
  assertGreater(src('child'), src_dir, msg_goin)
}

/* ⦿ Private Fucntions */
Deno.test(`prv:${repo_root_path.name}`, async () => {
  assertEquals(
    await repo_root_path(),
    new URL(import.meta.resolve('../')).pathname.slice(0, -1),
  )
})
