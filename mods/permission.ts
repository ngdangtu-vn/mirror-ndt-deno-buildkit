async function perm(descriptor: Deno.PermissionDescriptor, err?: Error | '') {
  const { state } = await Deno.permissions.request(descriptor)
  if (state === 'denied') {
    if (err) throw err
    return false
  }
  return true
}

export function request_read(path: string, error_msg?: string) {
  const err = error_msg && new Error(error_msg, {
    cause: `No permission to read [${path}] path from Deno.`,
  })
  return perm({ name: 'read', path }, err)
}

export function request_write(path: string, error_msg?: string) {
  const err = error_msg && new Error(error_msg, {
    cause: `No permission to write [${path}] path from Deno.`,
  })
  return perm({ name: 'write', path }, err)
}

export function request_net(host: string, error_msg?: string) {
  const err = error_msg && new Error(error_msg, {
    cause: `No permission to access [${host}] host from Deno.`,
  })
  return perm({ name: 'net', host }, err)
}

export function request_env(variable: string, error_msg?: string) {
  const err = error_msg && new Error(error_msg, {
    cause: `No permission to get [${variable}] env variable from Deno.`,
  })
  return perm({ name: 'env', variable }, err)
}

export function request_run(command: string, error_msg?: string) {
  const err = error_msg && new Error(error_msg, {
    cause: `No permission to run [${command}] command from Deno.`,
  })
  return perm({ name: 'run', command }, err)
}

// export function request_sys(kind: Deno.SysPermissionDescriptor.kind, error_msg?: string) {
//   const err = error_msg && new Error(error_msg, {
//     cause: `No permission to run [${kind}] command from Deno.`,
//   })
//   return perm({ name: 'sys', kind }, err)
// }
