#!/bin/bash

# Script to help update entity test files to use the new mock helper pattern
# Usage: ./scripts/update-entity-test.sh <test-file-name>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <test-file-name.test.ts>"
    echo "Example: $0 pricelistservices.test.ts"
    exit 1
fi

test_file="test/entities/$1"

if [ ! -f "$test_file" ]; then
    echo "Test file $test_file not found"
    exit 1
fi

echo "Updating $test_file..."

# Create backup
cp "$test_file" "$test_file.bak"

# Use sed to perform basic replacements
sed -i \
    -e 's/import axios, { AxiosInstance, AxiosResponse } from '\''axios'\'';/import { AxiosInstance } from '\''axios'\'';/' \
    -e '/} from '\''..\/..\/src\/entities\//a\
import {\
  createEntityTestSetup,\
  createMockItemResponse,\
  createMockItemsResponse,\
  resetAllMocks,\
  EntityTestSetup,\
} from '\''../helpers/mockHelper'\'';' \
    "$test_file"

echo "Basic pattern replacement completed. Manual review and completion needed."
echo "Please review $test_file and complete the following:"
echo "1. Update test setup to use createEntityTestSetup(EntityClass)"
echo "2. Replace entity variable references with setup.entity"
echo "3. Replace mockAxios references with setup.mockAxios"
echo "4. Replace manual response mocking with helper functions"
echo "5. Fix HTTP method expectations (list operations use POST to /query)"
echo ""
echo "See test/helpers/testPatterns.md for detailed examples."