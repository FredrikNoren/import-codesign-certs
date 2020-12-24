import * as core from '@actions/core'
import * as os from 'os'
import * as fs from 'fs'
import * as tmp from 'tmp'
import * as uuid from 'uuid'
import * as security from './security'
import * as actionState from './action-state'

async function main(): Promise<void> {
  try {
    if (os.platform() !== 'darwin') {
      throw new Error('Action requires macOS agent.')
    }

    const createKeychain: boolean = core.getInput('create-keychain') === 'true'
    let keychainName: string = core.getInput('keychain-name')
    let keychainPassword: string = core.getInput('keychain-password')
    let p12Filepath: string = core.getInput('p12-filepath')
    const p12FileBase64: string = core.getInput('p12-file-base64')
    const p12Password: string = core.getInput('p12-password')

    if (p12Filepath === '' && p12FileBase64 === '') {
      throw new Error(
        'At least one of p12-filepath or p12-file-base64 must be provided'
      )
    }

    if (p12FileBase64 !== '') {
      const buffer = Buffer.from(p12FileBase64, 'base64')
      const tempFile = tmp.fileSync()
      p12Filepath = tempFile.name
      fs.writeFileSync(p12Filepath, buffer)
    }

    if (keychainName === '') {
      keychainName = uuid.v4()
    }

    if (keychainPassword === '') {
      // generate a keychain password for the temporary keychain
      keychainPassword = Math.random().toString(36)
    }

    actionState.setDeleteKeychain(createKeychain)

    core.setOutput('keychain-name', keychainName)
    core.setOutput('keychain-password', keychainPassword)
    core.setSecret(keychainPassword)

    await security.installCertIntoTemporaryKeychain(
      keychainName,
      createKeychain,
      keychainPassword,
      p12Filepath,
      p12Password
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function cleanup(): Promise<void> {
  try {
    if (actionState.DeleteKeychain) {
      await security.deleteKeychain(actionState.KeychainName)
    }
  } catch (error) {
    core.warning(error)
  }
}

if (!actionState.IsPost) {
  main()
} else {
  cleanup()
}
