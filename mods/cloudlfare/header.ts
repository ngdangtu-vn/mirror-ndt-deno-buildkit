import { resolve } from 'https://deno.land/std@0.204.0/path/resolve.ts'
import setup_path from '../path.ts'

const { dist } = setup_path()

export type HeaderDirective = Record<string, unknown>
export type HeaderList = { [name: string]: HeaderDirective | string[] }
export type CspModifier = (name: string, source: string[]) => Promise<string[]>
export type Modifier = (item: string[]) => string[]

export function load_cf_headers(path: string) {
  return import(resolve(path), { assert: { type: 'json' } })
    .then((mod) => mod.default) as Promise<HeaderList>
}

/* ⦿ Entry Function */
export interface AssembleModifier {
  csp?: CspModifier
  other?: Modifier
}

export async function gen_cf_headers(
  cf_headers: HeaderList,
  hook?: AssembleModifier,
) {
  Deno.writeTextFile(
    dist('_headers'),
    await assemble_headers(cf_headers, hook),
  )
}

/* ⦿ Assemble Headers */
async function assemble_headers(
  cf_headers: HeaderList,
  hook?: AssembleModifier,
): Promise<string> {
  const route_list: string[] = []

  for (const [route, header_list] of Object.entries(cf_headers)) {
    if (route === '$schema') continue

    route_list.push(
      await assemble_route(route, header_list, hook),
    )
  }

  return route_list.join('\n')
}

async function assemble_route(
  route: string,
  list: HeaderDirective | string[],
  hook?: AssembleModifier,
): Promise<string> {
  //

  const header_list = [route]
  for (const [name, raw] of Object.entries(list)) {
    const is_array = Array.isArray(raw)
    if (is_array && raw.filter(rm_falsy).length === 0) continue
    // if (Object.keys(raw).filter(rm_falsy).length === 0) continue

    const value = to_header_value(raw)
    if (!value) continue

    const fmt_value = await assemble_route_filter(name, value, is_array, hook)
    if (!fmt_value) continue
    header_list.push(`    ${name}:${fmt_value}`)
  }
  return header_list.join('\n')
}
async function assemble_route_filter(
  name: string,
  val: string[] | HeaderDirective,
  is_array: boolean,
  hook?: AssembleModifier,
): Promise<string | undefined> {
  switch (name.toLowerCase()) {
    case 'link':
      if (is_array) {
        return void console.error('Incorrect HTTP Link header value')
      }
      return assemble_hint(val as HeaderDirective)

    case 'content-security-policy':
      if (is_array) {
        return void console.error('Incorrect CSP header value')
      }
      return await assemble_csp(val as HeaderDirective, hook?.csp)

    default:
      return void assemble_directive(val, hook?.other)
  }
}

/* ⦿ Assemble Directives */
/** Directive: General Purpose */
function assemble_directive(
  list: HeaderDirective | string[],
  modify?: Modifier,
): string {
  if (Array.isArray(list)) {
    if (modify) return modify(list).join(' ')
    return list.join(' ')
  }

  return Object.entries(list).map(([key, val]) => `${key}=${val}`).join(';')
}

/** Directive: Resource Hint */
function assemble_hint(directive_list: HeaderDirective): string {
  const list: string[] = []
  for (const [uri, attr_list] of Object.entries(directive_list)) {
    const hint = Object
      .entries(attr_list as Record<string, string>)
      .map(([attr, val]) => `${attr}="${val}"`)
    hint.unshift(`<${uri}>`)
    list.push(hint.join(';'))
  }
  return list.join(',')
}

/** Directive: Content Security Policy */
async function assemble_csp(
  directive_list: HeaderDirective,
  modify?: CspModifier,
): Promise<string> {
  const list: string[] = []
  for (const [name, source] of Object.entries(directive_list)) {
    const array_source = source as string[]
    const directive: string[] = modify
      ? await modify(name, array_source)
      : array_source

    if (directive.filter(rm_falsy).length < 1) continue
    directive.unshift(name)
    list.push(directive.join(' '))
  }
  return list.join(';')
}

/* ⦿ Helper Functions */
// @ts-ignore type is not matter in here
const rm_falsy = (v) => !!v
const to_header_value = (r: unknown) => {
  switch (typeof r) {
    case 'number':
    case 'bigint':
      return [r.toString()]

    case 'string':
      return [r]

    case 'boolean':
      return [r ? 'true' : 'false']

    case 'object':
      return r as HeaderDirective | string[]

    case 'undefined':
    case 'function':
    case 'symbol':
    default:
      return void 0
  }
}

/* ⦿ Private Export for Testcase Only */
export const _testonly = {
  assemble_headers,
  assemble_route,
  assemble_hint,
  assemble_csp,
}
