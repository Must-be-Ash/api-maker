#!/bin/bash

# Test Raw Skill Execution API
# This calls your skill API directly without any LLM parsing

echo "🧪 Testing Raw Skill Execution API"
echo "=================================="
echo ""
echo "Skill ID: skill_1765315026786_lcr498kum"
echo "Query: Vancouver to LAX, Dec 17-24, 2025"
echo ""
echo "Calling API..."
echo ""

curl -X POST http://localhost:3000/api/skills/skill_1765315026786_lcr498kum/execute \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "origin": "Vancouver",
      "destination": "LAX",
      "departureDate": "2025-12-17",
      "returnDate": "2025-12-24"
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>&1 | tee raw-api-response.json

echo ""
echo "✅ Response saved to: raw-api-response.json"
echo ""
echo "To view formatted:"
echo "  cat raw-api-response.json | jq ."
