#!/usr/bin/env python3
"""
Script to fix entity test files to use createEntityTestSetup helper
"""
import re
import os
from pathlib import Path

def get_entity_name_from_file(filepath):
    """Extract entity class name from file path"""
    basename = os.path.basename(filepath).replace('.test.ts', '')
    # Convert to proper case (first letter uppercase)
    return basename.capitalize()

def fix_imports(content):
    """Fix the import statements"""
    # Remove axios import, keep AxiosInstance
    content = re.sub(r'import axios, { AxiosInstance, AxiosResponse } from \'axios\';',
                     'import { AxiosInstance } from \'axios\';', content)
    
    # Add mock helper imports after the axios import
    import_insertion = '''import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';'''
    
    # Find the axios import line and add our imports after it
    axios_import_pattern = r'(import { AxiosInstance } from \'axios\';)'
    content = re.sub(axios_import_pattern, r'\1\n' + import_insertion, content)
    
    return content

def fix_describe_setup(content, entity_class):
    """Fix the describe block setup"""
    # Pattern to match the entire beforeEach/afterEach setup
    setup_pattern = r'(describe\([^{]+\{\s*let [^;]+;[^}]+afterEach[^}]+}\);)'
    
    new_setup = f'''describe('{entity_class} Entity', () => {{
  let setup: EntityTestSetup<{entity_class}>;

  beforeEach(() => {{
    setup = createEntityTestSetup({entity_class});
  }});

  afterEach(() => {{
    resetAllMocks(setup);
  }});'''
    
    # This is complex, let's use a simpler approach
    return content

def fix_method_calls(content, entity_name):
    """Fix method calls in the tests"""
    lower_entity = entity_name.lower()
    
    # Fix entity method calls
    content = re.sub(f'await {lower_entity}\.', 'await setup.entity.', content)
    
    # Fix mockAxios calls
    content = re.sub(r'mockAxios\.', 'setup.mockAxios.', content)
    content = re.sub(r'expect\(mockAxios\.', 'expect(setup.mockAxios.', content)
    
    # Fix query parameters
    content = re.sub(r'pageSize: (\d+)', r'MaxRecords: \1', content)
    
    return content

def fix_mock_responses(content):
    """Fix mock response calls"""
    # Fix list responses
    content = re.sub(
        r'mockAxios\.get\.mockResolvedValueOnce\(\{\s*data: \{ items: mockData \}[^}]+\}\);',
        'setup.mockAxios.post.mockResolvedValueOnce(\n        createMockItemsResponse(mockData)\n      );',
        content, flags=re.DOTALL
    )
    
    content = re.sub(
        r'mockAxios\.get\.mockResolvedValueOnce\(\{\s*data: \{ items: \[\] \}[^}]+\}\);',
        'setup.mockAxios.post.mockResolvedValueOnce(\n        createMockItemsResponse([])\n      );',
        content, flags=re.DOTALL
    )
    
    # Fix single item responses
    content = re.sub(
        r'mockAxios\.get\.mockResolvedValueOnce\(\{\s*data: \{ item: mockData \}[^}]+\}\);',
        'setup.mockAxios.get.mockResolvedValueOnce(\n        createMockItemResponse(mockData)\n      );',
        content, flags=re.DOTALL
    )
    
    # Fix create responses (status 201)
    content = re.sub(
        r'mockAxios\.post\.mockResolvedValueOnce\(\{\s*data: \{ item: mockResponse \}[^}]+status: 201[^}]+\}\);',
        'setup.mockAxios.post.mockResolvedValueOnce(\n        createMockItemResponse(mockResponse, 201)\n      );',
        content, flags=re.DOTALL
    )
    
    # Fix update responses
    content = re.sub(
        r'mockAxios\.put\.mockResolvedValueOnce\(\{\s*data: \{ item: mockResponse \}[^}]+\}\);',
        'setup.mockAxios.put.mockResolvedValueOnce(\n        createMockItemResponse(mockResponse)\n      );',
        content, flags=re.DOTALL
    )
    
    # Fix patch responses
    content = re.sub(
        r'mockAxios\.patch\.mockResolvedValueOnce\(\{\s*data: \{ item: mockResponse \}[^}]+\}\);',
        'setup.mockAxios.patch.mockResolvedValueOnce(\n        createMockItemResponse(mockResponse)\n      );',
        content, flags=re.DOTALL
    )
    
    # Fix delete responses
    content = re.sub(
        r'mockAxios\.delete\.mockResolvedValueOnce\(\{\s*data: \{\}[^}]+\}\);',
        'setup.mockAxios.delete.mockResolvedValueOnce(\n        createMockDeleteResponse()\n      );',
        content, flags=re.DOTALL
    )
    
    return content

def fix_test_expectations(content):
    """Fix test expectations for API calls"""
    # Change GET requests to POST for list operations
    content = re.sub(
        r'expect\(setup\.mockAxios\.get\)\.toHaveBeenCalledWith\(\'([^\']+)/query\', \{\s*params: \{\s*filter:',
        r"expect(setup.mockAxios.post).toHaveBeenCalledWith('\1/query', {\n        filter:",
        content
    )
    
    # Remove params wrapper
    content = re.sub(r'params: \{\s*filter:', 'filter:', content)
    content = re.sub(r'}\s*\}\);', '});', content)
    
    return content

def process_file(filepath):
    """Process a single test file"""
    print(f"Processing {filepath}...")
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Skip if already processed
    if 'createEntityTestSetup' in content:
        print(f"  Skipping - already uses new pattern")
        return
    
    entity_class = get_entity_name_from_file(filepath)
    
    # Apply fixes
    content = fix_imports(content)
    content = fix_method_calls(content, entity_class)
    content = fix_mock_responses(content)
    content = fix_test_expectations(content)
    
    # Write back
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"  Updated {filepath}")

def main():
    """Main function"""
    # Get all entity test files that need fixing
    test_dir = Path('test/entities')
    
    # Files already fixed
    fixed_files = {
        'actiontypes.test.ts',
        'pricelistservices.test.ts', 
        'ticketcharges.test.ts',
        'timeoffrequests.test.ts',
        'companies.test.ts',
        'quotes.test.ts'
    }
    
    # Get all test files
    test_files = [f for f in test_dir.glob('*.test.ts') if f.name not in fixed_files]
    
    print(f"Found {len(test_files)} files to process")
    
    # Process each file
    for i, test_file in enumerate(test_files[:5]):  # Process first 5 files
        process_file(str(test_file))
        
        if (i + 1) % 5 == 0:
            print(f"Processed {i + 1} files so far...")

if __name__ == '__main__':
    main()