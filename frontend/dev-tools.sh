#!/bin/bash
# 前端開發工具 - 完整版
# 確保可以真正操作和看到前端

set -e

FRONTEND_URL="http://localhost:5173/taipower-tou-web/"
PROJECT_DIR="$HOME/Project/taipower-tou-web/frontend"
SCREENSHOT_DIR="$HOME/Desktop/fe-dev"
mkdir -p "$SCREENSHOT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}    前端開發工具 - 完整版${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo "URL: $FRONTEND_URL"
echo ""

# 確保 Dev Server 執行
if ! lsof -i :5173 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Dev Server 未執行，啟動中...${NC}"
    cd "$PROJECT_DIR" && npm run dev > /tmp/vite-dev.log 2>&1 &
    sleep 3
    echo -e "${GREEN}✅ Dev Server 已啟動${NC}"
fi

# 顯示選單
show_menu() {
    clear
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}    前端開發工具${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo ""
    echo "  1. 開啟瀏覽器"
    echo "  2. 截圖當前頁面"
    echo "  3. 列出頁面元素"
    echo "  4. 點選測試"
    echo "  5. 完整流程測試"
    echo "  6. 檢視最近截圖"
    echo "  7. 開啟截圖目錄"
    echo "  8. 診斷檢查"
    echo ""
    echo "  0. 離開"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -n "選擇: "
}

# 主迴圈
while true; do
    show_menu
    read -r choice
    
    case "$choice" in
        1)
            echo -e "${BLUE}→ 開啟瀏覽器...${NC}"
            open "$FRONTEND_URL"
            echo -e "${GREEN}✅ 已開啟${NC}"
            ;;
        2)
            echo -e "${BLUE}→ 截圖中...${NC}"
            TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
            OUTPUT="$SCREENSHOT_DIR/screenshot-$TIMESTAMP.png"
            
            cd "$PROJECT_DIR"
            node -e "
import('playwright').then(async ({chromium}) => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1920, height: 1080}});
  await page.goto('$FRONTEND_URL', {waitUntil: 'domcontentloaded'});
  await page.screenshot({path: '$OUTPUT', fullPage: true});
  await browser.close();
}).catch(e => console.error('Error:', e.message));
" 2>/dev/null
            
            if [ -f "$OUTPUT" ]; then
                echo -e "${GREEN}✅ $OUTPUT${NC}"
                open "$OUTPUT"
            fi
            ;;
        3)
            echo -e "${BLUE}→ 列出元素...${NC}"
            cd "$PROJECT_DIR"
            node -e "
import('playwright').then(async ({chromium}) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('$FRONTEND_URL', {waitUntil: 'domcontentloaded'});
  
  console.log('');
  console.log('標題:', await page.title());
  console.log('');
  
  const buttons = await page.\$\$eval('button', els => els.map((el, i) => ({
    num: i + 1,
    text: (el.textContent || '').trim()
  })));
  
  console.log('按鈕 (' + buttons.length + '):');
  buttons.forEach(b => console.log('  ' + b.num + '. ' + b.text));
  
  await browser.close();
}).catch(console.error);
" 2>/dev/null
            ;;
        4)
            echo -e "${BLUE}→ 點選測試${NC}"
            echo -n "輸入選擇器 (預設: 手動輸入): "
            read -r selector
            selector="${selector:-button:has-text(\"手動輸入\")}"
            
            echo -e "${BLUE}→ 點選: $selector${NC}"
            
            BEFORE="$SCREENSHOT_DIR/before-$(date +%s).png"
            AFTER="$SCREENSHOT_DIR/after-$(date +%s).png"
            
            cd "$PROJECT_DIR"
            node -e "
import('playwright').then(async ({chromium}) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('$FRONTEND_URL', {waitUntil: 'domcontentloaded'});
  await page.screenshot({path: '$BEFORE'});
  await page.click('$selector');
  await page.waitForTimeout(1500);
  await page.screenshot({path: '$AFTER'});
  await browser.close();
}).catch(e => console.error('Error:', e.message));
" 2>/dev/null
            
            echo -e "${GREEN}✅ Before: $BEFORE${NC}"
            echo -e "${GREEN}✅ After:  $AFTER${NC}"
            open "$AFTER"
            ;;
        5)
            echo -e "${BLUE}→ 完整流程測試...${NC}"
            cd "$PROJECT_DIR"
            node test.mjs
            ;;
        6)
            echo -e "${BLUE}→ 檢視最近截圖...${NC}"
            LATEST=$(ls -t "$SCREENSHOT_DIR"/*.png 2>/dev/null | head -1)
            if [ -n "$LATEST" ]; then
                echo -e "${GREEN}✅ $LATEST${NC}"
                open "$LATEST"
            else
                echo -e "${YELLOW}⚠️  沒有截圖${NC}"
            fi
            ;;
        7)
            echo -e "${BLUE}→ 開啟截圖目錄...${NC}"
            open "$SCREENSHOT_DIR"
            ;;
        8)
            echo -e "${BLUE}→ 診斷檢查...${NC}"
            cd "$PROJECT_DIR"
            node -e "
import('playwright').then(async ({chromium}) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  
  await page.goto('$FRONTEND_URL', {waitUntil: 'domcontentloaded'});
  await page.waitForTimeout(1000);
  
  const title = await page.title();
  const buttons = await page.\$\$('button');
  
  console.log('');
  console.log('診斷結果:');
  console.log('  標題: ' + title);
  console.log('  按鈕: ' + buttons.length + ' 個');
  console.log('  錯誤: ' + errors.length + ' 個');
  
  if (errors.length === 0) {
    console.log('  狀態: ✅ 正常');
  } else {
    console.log('  狀態: ❌ 有錯誤');
    errors.forEach(e => console.log('    - ' + e));
  }
  
  await browser.close();
}).catch(console.error);
" 2>/dev/null
            ;;
        0|q|Q)
            echo "再見！"
            exit 0
            ;;
        *)
            echo -e "${YELLOW}無效選擇${NC}"
            ;;
    esac
    
    echo ""
    read -p "按 Enter 繼續..."
done
