# cursor-personal-skills

个人 **Cursor Agent Skills** 合集：语雀 **`lark`**、**周报**、**月报**。每个子目录为独立 skill（含 `SKILL.md`），可整体克隆，也可只拷贝需要的目录到 `~/.cursor/skills/`。

| 目录 | `name` | 用途 |
|------|--------|------|
| `lark/` | `lark` | 语雀 Open API 客户端：Cookie 登录、`api.ts` 调端点、`get-book-id` 等。 |
| `weekly-report/` | `weekly-report` | 从语雀「XX月工作」抽取最近一周，按周报格式生成。 |
| `monthly-report/` | `monthly-report` | 合并「第 x 周周报」与工作区周报，生成四段式月报。 |

## 依赖与敏感信息

- **lark**：需 `npm i`（Playwright 等）；**不要**将 `lark/.claude/yuque_cookies.txt` 提交到 Git（已 `.gitignore`）。
- **周报 / 月报**：依赖已配置好的 **lark** 与语雀知识库访问权限；可选：`工作总结/.cursor/zhoubao-design-links.json`（配图与设计稿，路径按你工作区调整）。

## 安装到 Cursor

```bash
git clone https://github.com/mihaideyu/cursor-personal-skills.git
cd cursor-personal-skills

# 符号链接（推荐，便于 git pull 更新）
ln -sf "$(pwd)/lark" ~/.cursor/skills/lark
ln -sf "$(pwd)/weekly-report" ~/.cursor/skills/weekly-report
ln -sf "$(pwd)/monthly-report" ~/.cursor/skills/monthly-report

# 或复制
# cp -R lark weekly-report monthly-report ~/.cursor/skills/
```

首次使用语雀前：

```bash
cd lark && npm i && npx tsx scripts/auth.ts
```

## 远程仓库

默认远程：`origin` → `https://github.com/mihaideyu/cursor-personal-skills.git`  
若你 fork 后用户名不同，请执行：

```bash
git remote set-url origin https://github.com/<你的用户名>/cursor-personal-skills.git
```

## 许可

技能正文为个人/工作用法说明；使用语雀与内网文档须自行遵守合规要求。
