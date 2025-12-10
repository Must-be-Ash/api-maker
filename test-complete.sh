#!/bin/bash

echo "========================================="
echo "Complete API Test with Log Capture"
echo "========================================="
echo ""

# Get current line count of log.md to capture only new logs
BEFORE_LINES=$(wc -l < /Users/ashnouruzi/api-maker/log.md 2>/dev/null || echo "0")
echo "Current log.md has $BEFORE_LINES lines"
echo ""

# Create timestamp for this test run
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="/Users/ashnouruzi/api-maker/test-results"
mkdir -p "$OUTPUT_DIR"

echo "📞 Making API call..."
echo ""

# Make API call and capture response
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
  2>&1 | tee "${OUTPUT_DIR}/api-response-${TIMESTAMP}.txt"

echo ""
echo "⏳ Waiting for logs to be written..."
sleep 2

# Get new line count
AFTER_LINES=$(wc -l < /Users/ashnouruzi/api-maker/log.md 2>/dev/null || echo "0")
NEW_LINES=$((AFTER_LINES - BEFORE_LINES))

echo ""
echo "📝 Extracting terminal logs ($NEW_LINES new lines)..."

# Extract only the new logs from this test run
tail -n "$NEW_LINES" /Users/ashnouruzi/api-maker/log.md > "${OUTPUT_DIR}/terminal-logs-${TIMESTAMP}.md"

echo ""
echo "✅ Test Complete!"
echo ""
echo "Results saved to:"
echo "  API Response: ${OUTPUT_DIR}/api-response-${TIMESTAMP}.txt"
echo "  Terminal Logs: ${OUTPUT_DIR}/terminal-logs-${TIMESTAMP}.md"
echo ""

# Try to extract and display key information
echo "========================================="
echo "Quick Summary"
echo "========================================="
echo ""

# Check if jq is available for JSON parsing
if command -v jq &> /dev/null; then
    echo "API Response Summary:"
    grep -o '{"success":.*}' "${OUTPUT_DIR}/api-response-${TIMESTAMP}.txt" | jq -r '
        "  Success: \(.success)",
        "  Strategy: \(.strategy)",
        "  Execution Time: \(.executionTime)ms",
        "  Completed: \(.data.completed)",
        "  Message Preview: \(.data.message[:100])..."
    ' 2>/dev/null || echo "  (Could not parse JSON)"
else
    echo "API Response Summary:"
    echo "  (Install jq for formatted output: brew install jq)"
    grep -o '"success":[^,]*' "${OUTPUT_DIR}/api-response-${TIMESTAMP}.txt" | head -3
fi

echo ""
echo "Terminal Logs Summary:"
grep -E "\[execute.*\]" "${OUTPUT_DIR}/terminal-logs-${TIMESTAMP}.md" | tail -10

echo ""
echo "========================================="
echo "View full results:"
echo "  cat ${OUTPUT_DIR}/api-response-${TIMESTAMP}.txt"
echo "  cat ${OUTPUT_DIR}/terminal-logs-${TIMESTAMP}.md"
echo "========================================="
