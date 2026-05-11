# 语雀 (Lark/Yuque) API 参考文档

## ⚠️ 重要提示

**语雀 API 返回的原始数据量非常大**（单次请求可能返回数千行 JSON），包含大量嵌套对象、用户信息、权限配置等无关字段。

**为节省 token 并保持上下文清晰，所有 API 调用都必须使用 jq 过滤**，仅提取必要的字段。

---

## 📖 使用场景

### 获取最近动态

**API**: `GET /api/recent/list`

**使用场景**：查看用户最近编辑的文档列表，了解最近的知识更新。

**请求参数**：
- `--limit=N`: 返回最近 N 条记录（可选）
- `--action=Edit`: 只查看编辑操作（可选）
- `--type=Doc`: 只查看文档类型（可选）

**数据路径**：`.data.list[]` （注意：不是 `.data[]`）

**关键字段**：
- `title`: 文档标题
- `book.name`: 知识库名称
- `updated_at`: 更新时间
- `book.user.login`: 用户登录名（用于构造 URL）
- `book.slug`: 知识库 slug
- `target.slug`: 文档 slug

**示例数据结构**：
```json
{
  "title": "对 claude code 的简单逆向分析",
  "book": "日拱一卒",
  "updated_at": "2026-01-16T02:20:25.000Z",
  "url": "https://yuque.antfin.com/qingquan.ql/dvs2gz/ufgi2ab2d4gm5f80"
}
```

---

### 读取文档内容

**API**: `GET /api/docs/:slug?book_id={book_id}`

**使用场景**：获取指定文档的详细信息（标题、字数、更新时间）和正文内容。

**请求参数**：
- `:slug`: 文档的 slug（从 URL 或最近动态中获取）
- `book_id`: 知识库 ID（必需，可使用 `get-book-id.ts` 工具提取）

**数据路径**：`.data`

**关键字段**：
- `title`: 文档标题
- `slug`: 文档 slug
- `word_count`: 字数
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `content`: 文档正文（HTML 格式）
- `book.user.login`: 用户登录名（用于构造 URL）
- `book.slug`: 知识库 slug

**示例数据结构**：
```json
{
  "title": "claude code 使用技巧",
  "slug": "hrk615tk5szgne32",
  "word_count": 903,
  "created_at": "2026-01-09T06:11:50.000Z",
  "updated_at": "2026-01-14T07:38:08.000Z",
  "url": "https://yuque.antfin.com/qingquan.ql/kg9hlm/hrk615tk5szgne32"
}
```

**文本处理提示**：
- 如需纯文本，可使用 `sed 's/<[^>]*>//g'` 去除 HTML 标签
- 预览部分内容可用 `head -100` 限制行数

---

### 查看版本历史

**API**: `GET /api/doc_versions?doc_id={doc_id}&doc_type=Doc&limit={limit}`

**使用场景**：查看文档的历史版本记录，了解文档的演进过程。

**请求参数**：
- `doc_id`: 文档 ID（数字，从最近动态的 `target_id` 或文档详情中获取）
- `doc_type=Doc`: 文档类型（固定值）
- `limit`: 返回最近 N 个版本（可选）

**数据路径**：`.data[]`

**关键字段**：
- `id`: 版本 ID
- `title`: 文档标题
- `created_at`: 创建时间
- `draft`: 是否为草稿版本

**示例数据结构**：
```json
{
  "id": 3239380645,
  "title": "claude code 使用技巧",
  "created_at": "2026-01-14T07:38:08.000Z",
  "draft": false
}
```

---

### 从 URL 提取 book_id

**工具**（在 lark skill 根目录执行）: `npx tsx scripts/get-book-id.ts {URL}`

**使用场景**：调用文档 API 时需要提供 `book_id` 参数，可通过此工具从文档 URL 中提取。

**使用方法**：
- 输入：语雀文档 URL，格式如 `https://yuque.antfin.com/{namespace}/{book}/{slug}`
- 输出：book_id 数字（如 `31352955`）
- 提示：可使用 `2>/dev/null` 过滤调试信息

---

## 辅助工具

### API 调用
`npx tsx scripts/api.ts {METHOD} {ENDPOINT} [JSON_BODY] [--param=val ...]`

### 登录认证
`npx tsx scripts/auth.ts` （Cookie 过期时使用）

---

## 注意事项

1. **必须使用 jq 过滤**: 原始返回数据量大（数千行），包含大量无关字段
2. **文档 ID 获取**: 从 `/api/recent/list` 响应的 `target_id` 字段获取
3. **错误处理**:
   - 401/403: Cookie 过期，重新运行 `auth.ts`
   - 404: 资源不存在
   - 422: 参数错误

