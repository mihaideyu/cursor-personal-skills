# 语雀：定位「XX月工作」文档

**目录（2026 知识库入口）**：[2026 年目录](https://yuque.antfin.com/yixiu.zyx/bc447s/eiaor4zeuls16ifq)

- **namespace**：`yixiu.zyx`
- **book slug**：`bc447s`
- **文档标题规范**：`{MM}月工作`，月份两位补零（如 `03月工作`、`12月工作`）

## Cookie 与命令目录语雀 API 脚本从 `process.cwd()` 读 Cookie，**必须在用户主目录执行**：

```bash
cd ~
```

## 获取 `book_id`

```bash
BOOK_ID=$(npx tsx .claude/skills/lark/scripts/get-book-id.ts \
  "https://yuque.antfin.com/yixiu.zyx/bc447s/eiaor4zeuls16ifq" 2>/dev/null)
```

若 `get-book-id` 对该 TOC 页失败，可改用当月文档 URL 或知识库内任意文档 URL。

## 查找目标文档 `slug`

**推荐**：`GET /api/recent/list`，限定文档、提高 limit，用 `jq` 按**精确标题**筛选：

```bash
cd ~ && npx tsx .claude/skills/lark/scripts/api.ts GET "/api/recent/list" --limit=80 --type=Doc 2>/dev/null \
  | jq -r '.data.list[] | select(.title == "03月工作") | {title, slug: .target.slug, book_id: .book_id}'
```

将 `03月工作` 替换为当月的 `{MM}月工作`。

- 取到的 `slug` 用于：`GET /api/docs/{slug}?book_id={BOOK_ID}`
- 若列表中无当月文档，可扩大 `--limit` 或请用户确认语雀中是否已创建该月文档

## 拉取正文

```bash
cd ~
# 假设 SLUG、BOOK_ID 已确定
npx tsx .claude/skills/lark/scripts/api.ts GET "/api/docs/${SLUG}?book_id=${BOOK_ID}" 2>/dev/null \
  | jq -r '.data | {title, content}'
```

`.data.content` 为 Lake/HTML，需在后续步骤中去标签或按标题切分。

---

详见通用语雀调用：`~/.claude/skills/lark/SKILL.md` 与 `references/lark_api.md`（与周报 skill 共用同一 lark 工具链）。
