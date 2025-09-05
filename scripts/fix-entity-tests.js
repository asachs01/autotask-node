#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get all entity test files
const testDir = path.join(__dirname, '../test/entities');
const entityTestFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.test.ts'));

console.log(`Found ${entityTestFiles.length} entity test files to update...`);

function updateTestFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already updated
  if (content.includes('createEntityTestSetup')) {
    console.log(`Skipping ${filePath} - already updated`);
    return;
  }

  let updatedContent = content;

  // Extract entity name from the file path
  const fileName = path.basename(filePath, '.test.ts');
  const entityName = fileName.charAt(0).toUpperCase() + fileName.slice(1);
  
  // Replace imports
  updatedContent = updatedContent.replace(
    /import {\s*describe,\s*it,\s*expect,\s*beforeEach,\s*afterEach,\s*jest,?\s*} from '@jest\/globals';\s*import axios, { AxiosInstance, AxiosResponse } from 'axios';\s*import winston from 'winston';/,
    `import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance } from 'axios';
import winston from 'winston';`
  );

  // Add mock helper imports
  const importEndIndex = updatedContent.indexOf(`} from '../../src/entities/${fileName}';`) + `} from '../../src/entities/${fileName}';`.length;
  const beforeImport = updatedContent.substring(0, importEndIndex);
  const afterImport = updatedContent.substring(importEndIndex);

  updatedContent = beforeImport + `
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';` + afterImport;

  // Replace test setup
  updatedContent = updatedContent.replace(
    /describe\('(.+) Entity', \(\) => {\s*let \w+: \w+;\s*let mockAxios: jest\.Mocked<AxiosInstance>;\s*let mockLogger: winston\.Logger;\s*beforeEach\(\(\) => {\s*mockAxios = {\s*get: jest\.fn\(\),\s*post: jest\.fn\(\),\s*put: jest\.fn\(\),\s*patch: jest\.fn\(\),\s*delete: jest\.fn\(\),[\s\S]*?interceptors: {\s*request: {\s*use: jest\.fn\(\),\s*eject: jest\.fn\(\),?\s*},?\s*response: {\s*use: jest\.fn\(\),\s*eject: jest\.fn\(\),?\s*},?\s*},?\s*} as any;\s*mockLogger = winston\.createLogger\({\s*level: 'error',\s*transports: \[new winston\.transports\.Console\({ silent: true }\)\],\s*}\);\s*\w+ = new \w+\(mockAxios, mockLogger\);\s*}\);\s*afterEach\(\(\) => {\s*jest\.clearAllMocks\(\);\s*}\);/,
    `describe('$1 Entity', () => {
  let setup: EntityTestSetup<${entityName}>;

  beforeEach(() => {
    setup = createEntityTestSetup(${entityName});
  });

  afterEach(() => {
    resetAllMocks(setup);
  });`
  );

  // Fix variable references in tests - this is a more complex pattern
  // Replace entity variable references
  const entityVarPattern = new RegExp(`\\b${fileName}\\b(?=\\.)`, 'g');
  updatedContent = updatedContent.replace(entityVarPattern, 'setup.entity');

  // Replace mockAxios references
  updatedContent = updatedContent.replace(/\bmockAxios\b/g, 'setup.mockAxios');

  // Replace manual response creation with helper functions
  // Handle single item responses
  updatedContent = updatedContent.replace(
    /mockAxios\.(get|post|put|patch|delete)\.mockResolvedValueOnce\(\{\s*data: \{ item: (.*?) \},\s*status: (\d+),\s*statusText: '[^']*',\s*headers: \{\},\s*config: \{\} as any,\s*\}\)/g,
    'setup.mockAxios.$1.mockResolvedValueOnce(\n        createMockItemResponse($2, $3)\n      )'
  );

  // Handle array responses  
  updatedContent = updatedContent.replace(
    /mockAxios\.(get|post|put|patch|delete)\.mockResolvedValueOnce\(\{\s*data: \{ items: (.*?) \},\s*status: (\d+),\s*statusText: '[^']*',\s*headers: \{\},\s*config: \{\} as any,\s*\}\)/g,
    'setup.mockAxios.$1.mockResolvedValueOnce(\n        createMockItemsResponse($2, $3)\n      )'
  );

  // Handle default status cases
  updatedContent = updatedContent.replace(
    /mockAxios\.(get|post|put|patch|delete)\.mockResolvedValueOnce\(\{\s*data: \{ item: (.*?) \},\s*status: 200,\s*statusText: 'OK',\s*headers: \{\},\s*config: \{\} as any,\s*\}\)/g,
    'setup.mockAxios.$1.mockResolvedValueOnce(\n        createMockItemResponse($2)\n      )'
  );

  updatedContent = updatedContent.replace(
    /mockAxios\.(get|post|put|patch|delete)\.mockResolvedValueOnce\(\{\s*data: \{ items: (.*?) \},\s*status: 200,\s*statusText: 'OK',\s*headers: \{\},\s*config: \{\} as any,\s*\}\)/g,
    'setup.mockAxios.$1.mockResolvedValueOnce(\n        createMockItemsResponse($2)\n      )'
  );

  // Fix .get calls with params to use .post for query endpoints
  updatedContent = updatedContent.replace(
    /(setup\.mockAxios)\.get\.mockResolvedValueOnce\(\s*createMockItemsResponse\([^)]+\)\s*\);\s*await setup\.entity\.list\([^)]*\);\s*expect\(\1\.get\)\.toHaveBeenCalledWith\('([^']+)\/query',\s*\{\s*params:\s*(\{[^}]+\})\s*\}\);/g,
    '$1.post.mockResolvedValueOnce(\n        createMockItemsResponse($3)\n      );\n\n      await setup.entity.list($4);\n\n      expect($1.post).toHaveBeenCalledWith(\'$2/query\', $3);'
  );

  fs.writeFileSync(filePath, updatedContent);
  console.log(`Updated ${filePath}`);
}

// Process each entity test file
entityTestFiles.forEach(file => {
  const filePath = path.join(testDir, file);
  try {
    updateTestFile(filePath);
  } catch (error) {
    console.error(`Error updating ${file}:`, error.message);
  }
});

console.log('Entity test file updates complete!');