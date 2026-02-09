import { readFileSync, writeFileSync } from 'fs';
import { Idl } from '@coral-xyz/anchor';

// Read the generated IDL
const idlJson = JSON.parse(readFileSync('./src/idl/stable_coin.json', 'utf8'));

// Generate TypeScript types
const typescriptCode = `
// This file is auto-generated. Do not edit manually.
// Run \`npm run generate-types\` to update.

export type StableCoin = ${JSON.stringify(idlJson, null, 2)};
`;

// Write the TypeScript file
writeFileSync('./src/idl/stable_coin.ts', typescriptCode);
console.log('TypeScript types generated successfully!');