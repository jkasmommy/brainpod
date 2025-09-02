#!/usr/bin/env tsx
/**
 * BrainPod Content Import Script
 * 
 * Node.js script to import content from static files into Supabase database.
 * Can be run locally for development or in CI/CD pipelines.
 * 
 * Usage:
 *   npm install -g tsx  # Install TypeScript runner
 *   tsx scripts/import-content.ts [--dry-run] [--force]
 * 
 * Environment variables required:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (admin access)
 *   CONTENT_IMPORT_SECRET - Secret key for import authentication (optional)
 * 
 * Options:
 *   --dry-run    Show what would be imported without making changes
 *   --force      Skip confirmation prompt
 *   --verbose    Show detailed progress information
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

interface ImportOptions {
  dryRun: boolean;
  force: boolean;
  verbose: boolean;
}

async function main() {
  console.log('🚀 BrainPod Content Import Script\n');

  // Parse command line arguments
  const options: ImportOptions = {
    dryRun: process.argv.includes('--dry-run'),
    force: process.argv.includes('--force'),
    verbose: process.argv.includes('--verbose')
  };

  // Validate environment
  const validation = validateEnvironment();
  if (!validation.valid) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach(error => console.error(`   ${error}`));
    process.exit(1);
  }

  if (options.verbose) {
    console.log('✅ Environment validation passed');
    console.log(`📁 Working directory: ${process.cwd()}`);
    console.log(`🎯 Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE IMPORT'}\n`);
  }

  // Check if content files exist
  const contentCheck = checkContentFiles();
  if (!contentCheck.valid) {
    console.error('❌ Content files check failed:');
    contentCheck.errors.forEach(error => console.error(`   ${error}`));
    process.exit(1);
  }

  if (options.verbose) {
    console.log('✅ Content files found:');
    contentCheck.files.forEach(file => console.log(`   📄 ${file}`));
    console.log();
  }

  // Prompt for confirmation (unless --force is used)
  if (!options.force && !options.dryRun) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('⚠️  This will modify your Supabase database. Continue? (y/N): ', resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('Import cancelled.');
      process.exit(0);
    }
  }

  // Run the import
  try {
    const result = await runImport(options);
    
    if (result.success) {
      console.log(`\n✅ Import completed successfully!`);
      console.log(`⏱️  Duration: ${result.duration_ms}ms`);
      console.log('\n📊 Import statistics:');
      Object.entries(result.stats).forEach(([key, value]) => {
        if (typeof value === 'number' && value > 0) {
          console.log(`   ${key}: ${value}`);
        }
      });

      if (result.stats.errors && result.stats.errors.length > 0) {
        console.log('\n⚠️  Warnings/Errors:');
        result.stats.errors.forEach((error: string) => console.log(`   ${error}`));
      }
    } else {
      console.error('\n❌ Import failed:');
      console.error(`   ${result.error}`);
      if (result.details) {
        console.error(`   Details: ${result.details}`);
      }
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Unexpected error during import:');
    console.error(error);
    process.exit(1);
  }
}

function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL does not appear to be a valid Supabase URL');
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && !serviceKey.startsWith('eyJ')) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY does not appear to be a valid JWT token');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function checkContentFiles(): { valid: boolean; errors: string[]; files: string[] } {
  const errors: string[] = [];
  const files: string[] = [];

  const requiredFiles = [
    'public/content/manifest.json',
    'public/content/skills.json'
  ];

  const optionalFiles = [
    'public/content/diagnostic/math-v1.json',
    'public/content/diagnostic/reading-v1.json',
    'public/content/diagnostic/science-v1.json',
    'public/content/diagnostic/social-studies-v1.json'
  ];

  // Check required files
  for (const filePath of requiredFiles) {
    const fullPath = join(process.cwd(), filePath);
    if (existsSync(fullPath)) {
      files.push(filePath);
    } else {
      errors.push(`Required file not found: ${filePath}`);
    }
  }

  // Check optional files
  for (const filePath of optionalFiles) {
    const fullPath = join(process.cwd(), filePath);
    if (existsSync(fullPath)) {
      files.push(filePath);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    files
  };
}

async function runImport(options: ImportOptions): Promise<any> {
  const url = 'http://localhost:3000/api/content/import';
  const importSecret = process.env.CONTENT_IMPORT_SECRET || 'dev-import-secret';

  const queryParams = options.dryRun ? '?dry_run=true' : '';
  const fullUrl = `${url}${queryParams}`;

  if (options.verbose) {
    console.log(`🌐 Making request to: ${fullUrl}`);
    console.log(`🔑 Using import secret: ${importSecret.substring(0, 8)}...`);
  }

  const response = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-import-secret': importSecret
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
