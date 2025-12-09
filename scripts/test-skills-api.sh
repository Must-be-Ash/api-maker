#!/bin/bash

# Skills API Testing Script
# Run this after starting the dev server with: pnpm dev

echo "🧪 Testing Skills System API Endpoints"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Test 1: Start Recording
echo "📹 Test 1: Starting Recording Session"
echo "--------------------------------------"

START_RESPONSE=$(curl -s -X POST "$BASE_URL/api/skills/start-recording" \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Test skill - navigate to example.com and click more information",
    "startUrl": "https://example.com"
  }')

echo "$START_RESPONSE" | jq '.'

# Extract recordingId and sessionId
RECORDING_ID=$(echo "$START_RESPONSE" | jq -r '.recordingId')
SESSION_ID=$(echo "$START_RESPONSE" | jq -r '.sessionId')
LIVE_VIEW_URL=$(echo "$START_RESPONSE" | jq -r '.liveViewUrl')

if [ "$RECORDING_ID" != "null" ] && [ "$RECORDING_ID" != "" ]; then
    echo -e "${GREEN}✓ Recording started successfully${NC}"
    echo "Recording ID: $RECORDING_ID"
    echo "Session ID: $SESSION_ID"
    echo "Live View: $LIVE_VIEW_URL"
else
    echo -e "${RED}✗ Failed to start recording${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⏸  Waiting 10 seconds for manual interaction...${NC}"
echo -e "${YELLOW}   (In production, user would perform actions in Live View)${NC}"
sleep 10

echo ""
echo "🏁 Test 2: Finishing Recording"
echo "--------------------------------------"

FINISH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/skills/finish-recording" \
  -H "Content-Type: application/json" \
  -d "{
    \"recordingId\": \"$RECORDING_ID\",
    \"sessionId\": \"$SESSION_ID\"
  }")

echo "$FINISH_RESPONSE" | jq '.'

SKILL_ID=$(echo "$FINISH_RESPONSE" | jq -r '.skillId')

if [ "$SKILL_ID" != "null" ] && [ "$SKILL_ID" != "" ]; then
    echo -e "${GREEN}✓ Skill created successfully${NC}"
    echo "Skill ID: $SKILL_ID"
else
    echo -e "${RED}✗ Failed to create skill${NC}"
    exit 1
fi

echo ""
echo "📖 Test 3: Fetching Skill Details"
echo "--------------------------------------"

GET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/skills/$SKILL_ID")

echo "$GET_RESPONSE" | jq '.name, .goal, .metrics'

if [ "$(echo "$GET_RESPONSE" | jq -r '.skillId')" == "$SKILL_ID" ]; then
    echo -e "${GREEN}✓ Skill fetched successfully${NC}"
else
    echo -e "${RED}✗ Failed to fetch skill${NC}"
    exit 1
fi

echo ""
echo "▶️  Test 4: Executing Skill"
echo "--------------------------------------"

EXECUTE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/skills/$SKILL_ID/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {}
  }')

echo "$EXECUTE_RESPONSE" | jq '.'

if [ "$(echo "$EXECUTE_RESPONSE" | jq -r '.success')" == "true" ]; then
    echo -e "${GREEN}✓ Skill executed successfully${NC}"
    echo "Strategy used: $(echo "$EXECUTE_RESPONSE" | jq -r '.strategy')"
    echo "Execution time: $(echo "$EXECUTE_RESPONSE" | jq -r '.executionTime')ms"
else
    echo -e "${RED}✗ Skill execution failed${NC}"
    echo "Error: $(echo "$EXECUTE_RESPONSE" | jq -r '.error // .message')"
fi

echo ""
echo "========================================"
echo "✅ All tests completed!"
echo ""
echo "📊 Summary:"
echo "  - Recording ID: $RECORDING_ID"
echo "  - Skill ID: $SKILL_ID"
echo "  - View skill: $BASE_URL/skills/$SKILL_ID"
echo ""
