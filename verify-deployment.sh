#!/bin/bash

# Digital Bodyguard Deployment Verification Script
# This script helps verify that your Netlify deployment is working correctly

set -e

echo "🛡️  Digital Bodyguard Deployment Verification"
echo "=============================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if URL is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./verify-deployment.sh https://your-site.netlify.app${NC}"
    echo "Please provide your Netlify site URL as an argument"
    exit 1
fi

SITE_URL="$1"
echo "Testing site: $SITE_URL"
echo ""

# Test 1: Check if site is accessible
echo "Test 1: Checking if site is accessible..."
if curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" | grep -q "200"; then
    echo -e "${GREEN}✓ Site is accessible${NC}"
else
    echo -e "${RED}✗ Site is not accessible${NC}"
    exit 1
fi

# Test 2: Check if frontend loads
echo ""
echo "Test 2: Checking if frontend HTML loads..."
if curl -s "$SITE_URL" | grep -q "Digital Bodyguard"; then
    echo -e "${GREEN}✓ Frontend HTML loads correctly${NC}"
else
    echo -e "${RED}✗ Frontend HTML not found${NC}"
    exit 1
fi

# Test 3: Check if _redirects work
echo ""
echo "Test 3: Checking SPA redirects..."
if curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/some-random-route" | grep -q "200"; then
    echo -e "${GREEN}✓ SPA redirects working${NC}"
else
    echo -e "${YELLOW}⚠ SPA redirects may not be working properly${NC}"
fi

# Test 4: Check Datadog webhook endpoint
echo ""
echo "Test 4: Testing Datadog webhook endpoint..."
WEBHOOK_RESPONSE=$(curl -s -X POST "$SITE_URL/.netlify/functions/datadog-webhook" \
    -H "Content-Type: application/json" \
    -d '{
        "alert": "Test alert",
        "location": "Test Location",
        "user_current_location": "Test",
        "attempts": 1
    }')

if echo "$WEBHOOK_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Datadog webhook endpoint working${NC}"
else
    echo -e "${RED}✗ Datadog webhook endpoint not responding correctly${NC}"
    echo "Response: $WEBHOOK_RESPONSE"
fi

# Test 5: Check if analyze-threat endpoint exists
echo ""
echo "Test 5: Testing AI analysis endpoint..."
ANALYZE_RESPONSE=$(curl -s -X POST "$SITE_URL/.netlify/functions/analyze-threat" \
    -H "Content-Type: application/json" \
    -d '{
        "alert": "Test threat",
        "location": "Unknown",
        "user_current_location": "Test",
        "attempts": 5
    }')

if echo "$ANALYZE_RESPONSE" | grep -q -E "(success|error|GEMINI_API_KEY)"; then
    if echo "$ANALYZE_RESPONSE" | grep -q "GEMINI_API_KEY not configured"; then
        echo -e "${YELLOW}⚠ AI analysis endpoint exists but GEMINI_API_KEY not configured${NC}"
        echo "  Please add your GEMINI_API_KEY environment variable in Netlify"
    else
        echo -e "${GREEN}✓ AI analysis endpoint responding${NC}"
    fi
else
    echo -e "${RED}✗ AI analysis endpoint not responding${NC}"
    echo "Response: $ANALYZE_RESPONSE"
fi

# Test 6: Check voice call endpoint
echo ""
echo "Test 6: Testing voice call endpoint..."
VOICE_RESPONSE=$(curl -s -X POST "$SITE_URL/.netlify/functions/trigger-voice-call" \
    -H "Content-Type: application/json" \
    -d '{
        "phone": "+1234567890",
        "script": "Test call"
    }')

if echo "$VOICE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✓ Voice call endpoint working (simulated)${NC}"
else
    echo -e "${RED}✗ Voice call endpoint not responding correctly${NC}"
    echo "Response: $VOICE_RESPONSE"
fi

# Summary
echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Deployment verification complete!${NC}"
echo ""
echo "Next steps:"
echo "1. If GEMINI_API_KEY warning appeared, add it in Netlify Dashboard"
echo "2. Test the UI by visiting: $SITE_URL"
echo "3. Try the Manual Interdiction feature in the UI"
echo "4. Set up Datadog webhook pointing to: $SITE_URL/.netlify/functions/datadog-webhook"
echo ""
echo "For detailed setup instructions, see DEPLOYMENT_GUIDE.md"
