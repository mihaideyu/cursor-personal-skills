# Cursor Agent Skills：周报 & 月报

本仓库收录两个面向 **Cursor**（及兼容「每个 skill 一个目录 + `SKILL.md`」约定的环境）的 **Agent Skill**：

| 目录 | 名称 | 用途 |
|------|------|------|
| `weekly-report/` | `weekly-report` | 从语雀「XX月工作」中抽取最近一周内容，按周报格式生成周报。 |
| `monthly-report/` | `monthly-report` | 合并语雀月文档中的「第 x 周周报」与工作区周报，生成四段式月报。 |

## 依赖

- **语雀**：需已安装可调用语雀 Open API 的 Agent 能力（例如本机 `lark` / 语雀 skill），并完成 Cookie 或 OAuth 等认证。月报 `SKILL.md` 中的示例路径为 `~/.claude/yuque_cookies.txt` 与 `npx tsx .claude/skills/lark/scripts/auth.ts`，请按你的实际目录调整。
- **工作区（可选）**：若存在 `工作总结/.cursor/zhoubao-design-links.json`，生成周报/月报时可插入设计稿链接与配图。

## 安装到 Cursor

将本仓库克隆到本地后，任选其一：

```bash
# 方式 A：符号链接（便于与本仓库同步更新）
ln -sf "$(pwd)/weekly-report" ~/.cursor/skills/weekly-report
ln -sf "$(pwd)/monthly-report" ~/.cursor/skills/monthly-report

# 方式 B：直接复制
cp -R weekly-report ~/.cursor/skills/
cp -R monthly-report ~/.cursor/skills/
```

重启或重新加载 Cursor 后，Agent 即可按 `SKILL.md` 中的描述触发对应技能。

## 推送到 GitHub

在仓库根目录执行（将 `YOUR_USER` 与仓库名换成你的）：

```bash
git init
git add .
git commit -m "Initial commit: weekly-report and monthly-report Cursor skills"
gh auth login   # 若尚未登录
gh repo create YOUR_USER/cursor-skills-weekly-monthly --public --source=. --remote=origin --push
```

若不用 GitHub CLI，可在 GitHub 网页新建空仓库后：

```bash
git remote add origin https://github.com/YOUR_USER/cursor-skills-weekly-monthly.git
git branch -M main
git push -u origin main
```

## 许可

技能正文为个人/工作用法说明；复制与修改请自行承担语雀与内网文档的合规责任。
