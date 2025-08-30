#!/usr/bin/env node

/**
 * Audit Script for Identifying Placeholder Implementations
 * 
 * This script scans the codebase to identify:
 * - Placeholder methods
 * - Stub implementations
 * - Hardcoded return values
 * - TODOs and FIXMEs
 * - Fake metrics
 * - Incomplete implementations
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PLACEHOLDER_PATTERNS = [
  // Comments indicating incomplete work
  { pattern: /\/\/\s*(TODO|FIXME|HACK|XXX|NOTE|PLACEHOLDER|STUB)/gi, type: 'comment-marker' },
  { pattern: /\/\*\s*(TODO|FIXME|HACK|XXX|NOTE|PLACEHOLDER|STUB)/gi, type: 'comment-marker' },
  
  // Placeholder implementations
  { pattern: /placeholder/gi, type: 'placeholder-keyword' },
  { pattern: /stub(?:bed)?/gi, type: 'stub-keyword' },
  { pattern: /mock(?:ed)?/gi, type: 'mock-keyword', excludeTests: true },
  { pattern: /fake/gi, type: 'fake-keyword', excludeTests: true },
  { pattern: /dummy/gi, type: 'dummy-keyword', excludeTests: true },
  
  // Not implemented patterns
  { pattern: /not\s+implemented/gi, type: 'not-implemented' },
  { pattern: /throw\s+new\s+Error\s*\(\s*['"`]not\s+implemented/gi, type: 'not-implemented-error' },
  { pattern: /coming\s+soon/gi, type: 'coming-soon' },
  
  // Hardcoded values that look suspicious
  { pattern: /return\s+(90|85|75|100|true|false|0|1)\s*;?\s*\/\/\s*(placeholder|fake|stub|todo)/gi, type: 'hardcoded-value' },
  { pattern: /return\s+['"`]placeholder/gi, type: 'hardcoded-string' },
  
  // Empty implementations
  { pattern: /{\s*\/\/\s*}\s*$/gm, type: 'empty-implementation' },
  { pattern: /{\s*}\s*$/gm, type: 'empty-block', checkContext: true },
  
  // Specific to this project
  { pattern: /For\s+now,?\s+(?:just\s+)?(?:return|use)\s+(?:a\s+)?placeholder/gi, type: 'temporary-placeholder' },
  { pattern: /This\s+is\s+a\s+placeholder/gi, type: 'explicit-placeholder' },
];

const EXCLUDE_PATHS = [
  'node_modules/**',
  'dist/**',
  'build/**',
  'coverage/**',
  '.git/**',
  '*.test.ts',
  '*.test.js',
  '*.spec.ts',
  '*.spec.js',
  'test/**',
  '__tests__/**',
  '__mocks__/**'
];

class PlaceholderAuditor {
  constructor() {
    this.findings = [];
    this.stats = {
      filesScanned: 0,
      placeholdersFound: 0,
      byType: {},
      byFile: {},
      bySeverity: {
        high: 0,
        medium: 0,
        low: 0
      }
    };
  }

  async audit(rootDir = '.') {
    console.log('Starting placeholder audit...\n');
    
    const files = await this.getFiles(rootDir);
    console.log(`Found ${files.length} files to scan\n`);
    
    for (const file of files) {
      await this.scanFile(file);
    }
    
    this.analyzeSeverity();
    this.generateReport();
    
    return this.findings;
  }

  async getFiles(rootDir) {
    const pattern = path.join(rootDir, 'src/**/*.{ts,js,tsx,jsx}');
    const examplePattern = path.join(rootDir, 'examples/**/*.{ts,js,tsx,jsx}');
    
    return new Promise((resolve, reject) => {
      glob(pattern, { ignore: EXCLUDE_PATHS }, (err, srcFiles) => {
        if (err) return reject(err);
        
        glob(examplePattern, { ignore: EXCLUDE_PATHS }, (err2, exampleFiles) => {
          if (err2) return reject(err2);
          resolve([...srcFiles, ...exampleFiles]);
        });
      });
    });
  }

  async scanFile(filePath) {
    this.stats.filesScanned++;
    
    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.');
    
    lines.forEach((line, lineNum) => {
      PLACEHOLDER_PATTERNS.forEach(patternDef => {
        // Skip certain patterns in test files
        if (isTestFile && patternDef.excludeTests) {
          return;
        }
        
        const matches = line.match(patternDef.pattern);
        if (matches) {
          // For empty blocks, check if it's actually a problem
          if (patternDef.checkContext && !this.isEmptyImplementationProblem(lines, lineNum)) {
            return;
          }
          
          const finding = {
            file: filePath,
            line: lineNum + 1,
            type: patternDef.type,
            code: line.trim(),
            context: this.getContext(lines, lineNum),
            functionName: this.getFunctionName(lines, lineNum),
            className: this.getClassName(lines, lineNum)
          };
          
          this.findings.push(finding);
          this.updateStats(finding);
        }
      });
    });
  }

  getContext(lines, lineNum, contextSize = 2) {
    const start = Math.max(0, lineNum - contextSize);
    const end = Math.min(lines.length - 1, lineNum + contextSize);
    
    return lines.slice(start, end + 1)
      .map((line, idx) => {
        const currentLine = start + idx;
        const prefix = currentLine === lineNum ? '>>>' : '   ';
        return `${prefix} ${currentLine + 1}: ${line}`;
      })
      .join('\n');
  }

  getFunctionName(lines, lineNum) {
    // Look backwards for function definition
    for (let i = lineNum; i >= Math.max(0, lineNum - 50); i--) {
      const line = lines[i];
      const functionMatch = line.match(/(?:async\s+)?(?:function\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*{/);
      const methodMatch = line.match(/(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*[\w<>[\]|]+)?\s*{/);
      const arrowMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/);
      
      if (functionMatch) return functionMatch[1];
      if (methodMatch) return methodMatch[1];
      if (arrowMatch) return arrowMatch[1];
    }
    
    return 'unknown';
  }

  getClassName(lines, lineNum) {
    // Look backwards for class definition
    for (let i = lineNum; i >= Math.max(0, lineNum - 100); i--) {
      const line = lines[i];
      const classMatch = line.match(/(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/);
      
      if (classMatch) return classMatch[1];
    }
    
    return null;
  }

  isEmptyImplementationProblem(lines, lineNum) {
    const line = lines[lineNum];
    
    // Check if it's a one-liner function/method that might be intentionally empty
    if (line.match(/=>\s*{\s*}/)) return false;
    
    // Check if it's an interface or type definition
    const prevLine = lineNum > 0 ? lines[lineNum - 1] : '';
    if (prevLine.match(/interface|type\s+\w+/)) return false;
    
    // Check if it's a constructor or method that might be intentionally empty
    if (prevLine.match(/constructor\s*\(|ngOnInit|ngOnDestroy/)) return false;
    
    return true;
  }

  updateStats(finding) {
    this.stats.placeholdersFound++;
    
    // Update by type
    if (!this.stats.byType[finding.type]) {
      this.stats.byType[finding.type] = 0;
    }
    this.stats.byType[finding.type]++;
    
    // Update by file
    if (!this.stats.byFile[finding.file]) {
      this.stats.byFile[finding.file] = [];
    }
    this.stats.byFile[finding.file].push(finding);
  }

  analyzeSeverity() {
    this.findings.forEach(finding => {
      let severity = 'low';
      
      // High severity indicators
      if (finding.type === 'not-implemented' || 
          finding.type === 'not-implemented-error' ||
          finding.type === 'explicit-placeholder' ||
          finding.type === 'temporary-placeholder') {
        severity = 'high';
      }
      // Medium severity indicators
      else if (finding.type === 'placeholder-keyword' ||
               finding.type === 'stub-keyword' ||
               finding.type === 'hardcoded-value' ||
               finding.type === 'fake-keyword') {
        severity = 'medium';
      }
      // Additional context-based severity
      else if (finding.file.includes('business') ||
               finding.file.includes('validation') ||
               finding.file.includes('migration') ||
               finding.file.includes('integrity')) {
        severity = 'medium';
      }
      
      finding.severity = severity;
      this.stats.bySeverity[severity]++;
    });
  }

  generateReport() {
    // Generate summary
    console.log('='.repeat(80));
    console.log('PLACEHOLDER AUDIT REPORT');
    console.log('='.repeat(80));
    console.log(`\nFiles Scanned: ${this.stats.filesScanned}`);
    console.log(`Total Placeholders Found: ${this.stats.placeholdersFound}\n`);
    
    console.log('By Severity:');
    Object.entries(this.stats.bySeverity).forEach(([severity, count]) => {
      console.log(`  ${severity.toUpperCase()}: ${count}`);
    });
    
    console.log('\nBy Type:');
    Object.entries(this.stats.byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    
    console.log('\nTop Files with Most Placeholders:');
    Object.entries(this.stats.byFile)
      .map(([file, findings]) => ({ file, count: findings.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .forEach(({ file, count }) => {
        const relPath = path.relative(process.cwd(), file);
        console.log(`  ${relPath}: ${count}`);
      });
    
    // Generate CSV report
    this.generateCSV();
    
    // Generate JSON report
    this.generateJSON();
  }

  generateCSV() {
    const csvPath = path.join(process.cwd(), 'placeholder-audit.csv');
    
    const headers = [
      'File',
      'Line',
      'Type',
      'Severity',
      'Function/Method',
      'Class',
      'Code',
      'Required Implementation'
    ];
    
    const rows = this.findings.map(f => [
      path.relative(process.cwd(), f.file),
      f.line,
      f.type,
      f.severity,
      f.functionName || '',
      f.className || '',
      f.code.replace(/"/g, '""'),
      this.getRequiredImplementation(f)
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    fs.writeFileSync(csvPath, csv);
    console.log(`\nCSV report saved to: ${csvPath}`);
  }

  generateJSON() {
    const jsonPath = path.join(process.cwd(), 'placeholder-audit.json');
    
    const report = {
      summary: this.stats,
      findings: this.findings.map(f => ({
        ...f,
        requiredImplementation: this.getRequiredImplementation(f),
        estimatedComplexity: this.estimateComplexity(f),
        priority: this.calculatePriority(f)
      }))
    };
    
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`JSON report saved to: ${jsonPath}`);
  }

  getRequiredImplementation(finding) {
    const implementations = {
      'not-implemented': 'Implement full functionality according to API specification',
      'placeholder-keyword': 'Replace with actual implementation',
      'stub-keyword': 'Complete stub implementation',
      'hardcoded-value': 'Calculate or fetch actual value',
      'fake-keyword': 'Replace with real data/logic',
      'empty-implementation': 'Add required implementation logic',
      'comment-marker': 'Address TODO/FIXME comment',
      'temporary-placeholder': 'Replace temporary code with permanent solution'
    };
    
    return implementations[finding.type] || 'Review and implement required functionality';
  }

  estimateComplexity(finding) {
    // Simple heuristic for complexity estimation
    if (finding.className?.includes('Migration') || 
        finding.className?.includes('Validation') ||
        finding.functionName?.includes('validate')) {
      return 'high';
    }
    
    if (finding.type === 'empty-implementation' ||
        finding.type === 'not-implemented') {
      return 'medium';
    }
    
    return 'low';
  }

  calculatePriority(finding) {
    // Priority based on location and type
    if (finding.file.includes('client/AutotaskClient') ||
        finding.file.includes('entities/') ||
        finding.severity === 'high') {
      return 'high';
    }
    
    if (finding.file.includes('migration/') ||
        finding.file.includes('validation/') ||
        finding.severity === 'medium') {
      return 'medium';
    }
    
    return 'low';
  }
}

// Run the audit
async function main() {
  const auditor = new PlaceholderAuditor();
  
  try {
    await auditor.audit();
    console.log('\nAudit complete!');
    process.exit(0);
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PlaceholderAuditor;