#!/bin/bash

# Script to fix entity test files to use createEntityTestSetup helper

# Get list of files that still need fixing
files=$(find test/entities -name "*.test.ts" | grep -v -E "(actiontypes|pricelistservices|ticketcharges|timeoffrequests|companies|quotes)")

echo "Found $(echo "$files" | wc -l) files to fix"

# Process files in batches
count=0
for file in $files; do
    echo "Processing $file..."
    
    # Extract entity name from file path (e.g., test/entities/tickets.test.ts -> Tickets)
    entity_name=$(basename "$file" .test.ts)
    entity_class=$(echo "$entity_name" | sed 's/./\U&/')  # Capitalize first letter
    
    # Skip if file already uses new pattern
    if grep -q "createEntityTestSetup" "$file"; then
        echo "  Skipping $file - already uses new pattern"
        continue
    fi
    
    # Create a temp file for the updated content
    temp_file=$(mktemp)
    
    # Read the file and perform replacements
    sed '
        # Update imports - remove axios import, add mock helper imports
        s/import axios, { AxiosInstance, AxiosResponse } from '\''axios'\'';/import { AxiosInstance } from '\''axios'\'';/
        /^import.*from '\''axios'\'';$/a\
import {\
  createEntityTestSetup,\
  createMockItemResponse,\
  createMockItemsResponse,\
  createMockDeleteResponse,\
  resetAllMocks,\
  EntityTestSetup,\
} from '\''../helpers/mockHelper'\'';
        
        # Update the describe block setup - replace the whole beforeEach section
        /let [a-zA-Z]*: [A-Z][a-zA-Z]*;/,/afterEach.*{$/c\
  let setup: EntityTestSetup<'$entity_class'>;\
\
  beforeEach(() => {\
    setup = createEntityTestSetup('$entity_class');\
  });\
\
  afterEach(() => {\
    resetAllMocks(setup);\
  });
        
        # Fix method calls
        s/await [a-zA-Z]*\./await setup.entity./g
        s/expect(mockAxios\./expect(setup.mockAxios./g
        s/pageSize: /MaxRecords: /g
        
    ' "$file" > "$temp_file"
    
    # Check if the sed worked
    if [ -s "$temp_file" ]; then
        mv "$temp_file" "$file"
        echo "  Updated $file"
    else
        echo "  Error processing $file"
        rm "$temp_file"
    fi
    
    count=$((count + 1))
    
    # Process in batches of 20
    if [ $((count % 20)) -eq 0 ]; then
        echo "Processed $count files so far..."
        sleep 1
    fi
done

echo "Finished processing all files"