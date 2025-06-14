#!/usr/bin/env node

const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
const minorVersion = parseInt(nodeVersion.slice(1).split('.')[1]);

console.log(`Current Node.js version: ${nodeVersion}`);

// Check if version meets Next.js requirements: ^18.18.0 || ^19.8.0 || >= 20.0.0
let isCompatible = false;

if (majorVersion >= 20) {
    isCompatible = true;
} else if (majorVersion === 19 && minorVersion >= 8) {
    isCompatible = true;
} else if (majorVersion === 18 && minorVersion >= 18) {
    isCompatible = true;
}

if (isCompatible) {
    console.log('✅ Node.js version is compatible with Next.js');
} else {
    console.log('❌ Node.js version is NOT compatible with Next.js');
    console.log('Required: ^18.18.0 || ^19.8.0 || >= 20.0.0');
    console.log('\nTo fix this:');
    console.log('1. Update Node.js to version 20+ (recommended)');
    console.log('2. Or use nvm to switch versions:');
    console.log('   nvm install 20');
    console.log('   nvm use 20');
    console.log('3. Or update to Node.js 18.18.0+');
} 