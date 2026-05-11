# 语雀月报拉取流程

**注意**：语雀 API 脚本会依次尝试当前工作目录与 **lark skill 根目录**下的 `.claude/yuque_cookies.txt`。**推荐**在 lark skill 根目录执行（本仓库为 `lark/`，与 `package.json` 同级）。

## 获取「xx月工作」文档内容

### 方式一：通过最近动态查找文档 slug

1. 调用 `GET /api/recent/list`，参数 `--limit=50`、`--type=Doc`
2. 用 jq 筛选 `title` 匹配「月工作」的文档，取当月（如 3 月取「03月工作」）
3. 从结果中取 `target.slug`、`book.slug`、`book.user.login`
4. 用 `scripts/get-book-id.ts` 从任意该知识库下的文档 URL 获取 `book_id`

```bash
# 示例：在 lark skill 根目录执行
cd lark
npx tsx scripts/api.ts GET "/api/recent/list" --limit=50 --type=Doc 2>/dev/null | jq '.data.list[] | select(.title | test("月工作")) | {title, slug: .target.slug, book: .book.slug}'
```

### 方式二：已知文档 URL 时直接拉取

若已知当月文档 URL（如 `https://yuque.antfin.com/yixiu.zyx/bc447s/skvzrfu6504zkrwg`）：

```bash
cd lark
BOOK_ID=$(npx tsx scripts/get-book-id.ts "https://yuque.antfin.com/yixiu.zyx/bc447s/<doc_slug>" 2>/dev/null)
npx tsx scripts/api.ts GET "/api/docs/<doc_slug>?book_id=${BOOK_ID}" 2>/dev/null | jq -r '.data | {title, content, updated_at}'
```

### 提取纯文本

语雀返回的 `content` 为 HTML，可去标签：

```bash
# 去除 HTML 标签
echo "$content" | sed 's/<[^>]*>//g'
```

## 知识库信息

- **2026 年目录 URL**：`https://yuque.antfin.com/yixiu.zyx/bc447s/eiaor4zeuls16ifq`
- **book slug**：`bc447s`
- **namespace**：`yixiu.zyx`
