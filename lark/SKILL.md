---
name: lark
description: 语雀 (Yuque) 工具集，支持基于 Cookie 读取文档、查看历史及获取相关文档列表。
---

# 语雀 (Lark) 访问 Skill

此 Skill 采用"通用客户端 + API 文档"的架构。Agent 需阅读 API 参考文档，根据需求构造请求。

## 📋 快速开始

### 初始化与登录

**首次使用时需要先安装依赖并登录，Cookie 会自动保存供后续使用。**

以下命令均在 **本 skill 根目录**（与 `package.json` 同级，克隆本仓库时为 `…/cursor-personal-skills/lark/`）下执行。当 API 调用返回 401/403 时，说明 Cookie 已过期，需要重新登录：

```bash
# 首次使用需要先安装依赖
npm i

# 启动浏览器进行登录（Cookie 写入本目录下 .claude/yuque_cookies.txt）
npx tsx scripts/auth.ts
```

脚本启动后，请在弹出的浏览器窗口中登录语雀。登录成功后，脚本会自动检测 Cookie 并持续更新保存。**Cookie 长期有效，无需每次使用都重新登录。**

### 基本用法

```bash
npx tsx scripts/api.ts <METHOD> <ENDPOINT> [JSON_BODY] [--param=val ...]
```

**参数说明**：
- **METHOD**: `GET`, `POST`, `PUT`, `DELETE`
- **ENDPOINT**: API 路径，必须以 `/api/` 开头（如 `/api/recent/list`, `/api/docs/:slug`）
- **JSON_BODY**: (可选) JSON 格式的请求体字符串
- **Params**: (可选) 查询参数，如 `--limit=5`

### 辅助工具

**提取文档 book_id**：从语雀文档 URL 中提取 book_id（调用 API 时需要）

```bash
npx tsx scripts/get-book-id.ts <YUQUE_URL>
```

**示例**：
```bash
# 从 URL 提取 book_id
BOOK_ID=$(npx tsx scripts/get-book-id.ts "https://yuque.antfin.com/antcode/help/zxia4g" 2>/dev/null)

# 使用提取的 book_id 获取文档内容
npx tsx scripts/api.ts GET "/api/docs/zxia4g?book_id=${BOOK_ID}"
```

---

## 🤖 交互指南

**当用户指令模糊（例如仅输入 "/lark" 或 "最近有什么更新"）时，请按以下步骤主动服务：**

1. **查询最近动态**：自动调用 API 获取用户最近编辑的文档列表
2. **展示列表**：向用户展示文档标题、知识库、更新时间和完整访问链接
3. **主动询问**：询问用户是否需要读取某篇文档的详情，或对内容进行总结分析

👉 **详细执行方式**: [获取最近动态](references/lark_api.md#获取最近动态)

**注意**：始终使用 `jq` 过滤 API 返回数据，只提取用户真正需要的字段，减少 token 消耗。

---

## 🎯 常用场景

### 1. 获取最近动态

**使用场景**：查看用户最近编辑的文档列表。

👉 **详细执行方式**: [获取最近动态](references/lark_api.md#获取最近动态)

### 2. 读取文档内容

**使用场景**：获取指定文档的详细信息和正文内容。

👉 **详细执行方式**: [读取文档内容](references/lark_api.md#读取文档内容)

### 3. 查看版本历史

**使用场景**：查看文档的历史版本记录。

👉 **详细执行方式**: [查看版本历史](references/lark_api.md#查看版本历史)

---

## 📚 API 参考

完整的 API 文档和端点说明，请查看：[references/lark_api.md](references/lark_api.md)

**常用端点**：
- `GET /api/recent/list` - 获取最近动态
- `GET /api/docs/:slug` - 获取文档详情
- `GET /api/doc_versions` - 获取版本历史
