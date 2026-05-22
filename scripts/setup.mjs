import { existsSync, copyFileSync } from 'node:fs'

if (!existsSync('./config.ts')) {
  copyFileSync('./example-config.ts', './config.ts')
  console.log('✓ config.ts created from example-config.ts')
}
