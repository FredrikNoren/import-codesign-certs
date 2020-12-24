import * as coreCommand from '@actions/core/lib/command'

export const IsPost = process.env['STATE_isPost'] === 'true'

export const DeleteKeychain = process.env['STATE_deleteKeychain'] === 'true'

export function setDeleteKeychain(deleteKeychain: boolean): void {
  coreCommand.issueCommand(
    'save-state',
    {name: 'deleteKeychain'},
    deleteKeychain.toString()
  )
}

export const KeychainName = (process.env['STATE_keychainName'] as string) || ''

export function setKeychainName(keychainName: string): void {
  coreCommand.issueCommand('save-state', {name: 'keychainName'}, keychainName)
}

if (!IsPost) {
  coreCommand.issueCommand('save-state', {name: 'isPost'}, 'true')
}
