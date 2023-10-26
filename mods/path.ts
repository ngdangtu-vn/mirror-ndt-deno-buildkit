import { resolve } from 'https://deno.land/std@0.204.0/path/resolve.ts'

import { request_env, request_run } from './permission.ts'

const root = await request_env('REPO_ROOT_PATH') && Deno.env.get('REPO_ROOT_PATH') ||
  await repo_root_path()

async function repo_root_path() {
  await request_run('git', 'Unable to guess repository root path.')

  const cmd = new Deno.Command('git', {
    args: ['rev-parse', '--show-toplevel'],
  })
  const { code, stdout } = await cmd.output()

  if (code != 0) return void 0
  return new TextDecoder().decode(stdout).trim()
}

export interface BookmarkList {
  base: (...expand: string[]) => string
  [fn: string]: (...expand: string[]) => string
}

export default function setup_path(
  bookmark_path?: Record<string, string>,
): BookmarkList {
  if (!root) {
    throw new Error(
      'Unable to detect project root path. You can set it manually with [REPO_ROOT_PATH] environment variable or keep your project with [Git] repository.',
    )
  }

  function base(...path: string[]) {
    return resolve(root!, ...path)
  }
  if (!bookmark_path) return { base }

  function new_bookmark(
    carrier: BookmarkList,
    [fn_name, path]: [string, string],
  ) {
    carrier[fn_name] = (...expand: string[]) => base(path, ...expand)
    return carrier
  }
  return Object.entries(bookmark_path).reduce(new_bookmark, { base })
}

export const _testonly = { root, repo_root_path }
