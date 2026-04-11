#!/bin/bash

# ============================================================================
# REELCART - 401 ERROR DIAGNOSTIC
# ============================================================================
# This script helps identify what's causing the 401 errors
#
# Usage: bash diagnose-401.sh
# ============================================================================

echo "🔍 ReelCart 401 Error Diagnostic"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check 1: Middleware files
echo "📋 Checking middleware files..."
echo ""

if [ -f "layers/auth/middleware/auth.global.ts" ]; then
    echo -e "${GREEN}✓${NC} Found: layers/auth/middleware/auth.global.ts"
    
    # Check if it has the early return check
    if grep -q "if (!user.value)" layers/auth/middleware/auth.global.ts; then
        echo -e "${GREEN}  ✓ Has session check${NC}"
    else
        echo -e "${RED}  ✗ Missing session check!${NC}"
    fi
    
    # Check if it returns before API call
    if grep -A 3 "if (!user.value)" layers/auth/middleware/auth.global.ts | grep -q "return"; then
        echo -e "${GREEN}  ✓ Returns early (no API call)${NC}"
    else
        echo -e "${RED}  ✗ No early return! (will call API)${NC}"
    fi
else
    echo -e "${RED}✗ Missing: layers/auth/middleware/auth.global.ts${NC}"
fi

# Check for old middleware file
if [ -f "layers/auth/middleware/auth.ts" ]; then
    echo -e "${YELLOW}⚠${NC} Found old middleware: layers/auth/middleware/auth.ts"
    echo "  → This might be causing conflicts!"
fi

echo ""

# Check 2: Profile endpoint
echo "📋 Checking profile endpoint..."
echo ""

if [ -f "server/api/auth/profile.get.ts" ]; then
    echo -e "${GREEN}✓${NC} Found: server/api/auth/profile.get.ts"
    
    if grep -q "requireAuth" server/api/auth/profile.get.ts; then
        echo -e "${GREEN}  ✓ Has requireAuth (this is OK - it should require auth)${NC}"
    fi
else
    echo -e "${RED}✗ Missing: server/api/auth/profile.get.ts${NC}"
fi

echo ""

# Check 3: Auth store
echo "📋 Checking auth store..."
echo ""

if [ -f "layers/auth/stores/auth.store.ts" ]; then
    echo -e "${GREEN}✓${NC} Found: layers/auth/stores/auth.store.ts"
    
    # Check for auto-fetch
    if grep -q "onMounted\|fetchUserProfile" layers/auth/stores/auth.store.ts; then
        # Check context
        if grep -B 5 "fetchUserProfile" layers/auth/stores/auth.store.ts | grep -q "onMounted"; then
            echo -e "${RED}  ✗ Auto-fetches profile on mount! This could cause issues${NC}"
            echo "    → Remove the onMounted auto-fetch"
        fi
    fi
else
    echo -e "${RED}✗ Missing: layers/auth/stores/auth.store.ts${NC}"
fi

echo ""

# Check 4: Auth lifecycle plugin
echo "📋 Checking auth lifecycle plugin..."
echo ""

if [ -f "layers/auth/plugins/auth-lifecycle.client.ts" ]; then
    echo -e "${GREEN}✓${NC} Found: layers/auth/plugins/auth-lifecycle.client.ts"
    
    # Check if it has content
    if [ -s "layers/auth/plugins/auth-lifecycle.client.ts" ]; then
        echo -e "${GREEN}  ✓ Has content${NC}"
    else
        echo -e "${RED}  ✗ File is empty!${NC}"
    fi
else
    echo -e "${RED}✗ Missing: layers/auth/plugins/auth-lifecycle.client.ts${NC}"
fi

echo ""
echo "=================================="
echo "📊 Summary"
echo "=================================="
echo ""
echo "If you see ✗ errors above, that's what's causing 401 errors!"
echo ""
echo "Common causes:"
echo "  1. Middleware missing session check → Add 'if (!user.value) return'"
echo "  2. Old middleware file exists → Remove layers/auth/middleware/auth.ts"
echo "  3. Auth store auto-fetches → Remove onMounted auto-fetch"
echo "  4. Lifecycle plugin empty → Copy new version"
echo ""
echo "Quick fix:"
echo "  cp layers_auth_middleware_auth_global_ULTRA_SAFE.ts layers/auth/middleware/auth.global.ts"
echo "  npm run dev"
echo ""