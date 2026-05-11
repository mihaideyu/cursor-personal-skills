---
name: weekly-report
description: Generates weekly work reports from Yuque monthly logs. Use when the user asks to summarize this week's work, generate a weekly report, or similar prompts like "帮我总结下本周工作内容" or "帮我生成周报".
---

# 周报生成 Skill

从语雀月报中提取最近一周工作内容，按周报格式规范生成周报。

## 执行流程

### 1. 确定日期与范围

- **默认**：除非用户指定统计日期范围，否则使用 T-6 ~ T-0（共 7 天）
- **T**：用户发出指令时的日期（当前日期）
- **用户指定**：若用户明确指定了范围（如「03-01 到 03-07」「上周」），则使用用户指定的范围
- **示例**：若 T=3 月 8 日且未指定，则范围为 03-02 ~ 03-08

### 2. 拉取语雀月报内容

调用语雀 skill，获取指定月份的「xx月工作」文档：

- **知识库**：2026 年目录 `https://yuque.antfin.com/yixiu.zyx/bc447s/eiaor4zeuls16ifq`
- **文档命名**：`{MM}月工作`，月份补零（1 月→01月工作，3 月→03月工作，12 月→12月工作）
- **获取方式**：见 [references/yuque_workflow.md](references/yuque_workflow.md)

### 3. 提取最近一周内容

从月报文档中提取 T-6 ~ T-0 日期范围内的工作记录（按文档中的日期标题或内容结构解析）。

### 4. 读取配图与链接配置

在生成周报前，读取工作区 `工作总结/.cursor/zhoubao-design-links.json`（若存在）：

- **design_links**：工作项名称 → Figma 设计稿 URL
- **images**：工作项名称 → 配图列表 `[{path, alt}, ...]`

用于在生成时自动插入设计稿链接和配图。

### 5. 生成周报

按周报格式规范整理输出，格式要求见 [references/zhoubao_format.md](references/zhoubao_format.md)。**重点需求/项目**在书面语中融合 **背景、过程、结果、问题（如有）、设计价值**，**不要用五要素子项目符号模板**；非重点从简。

**配图与链接插入规则**：

- 若某条工作项在 `design_links` 中有匹配，在描述末尾追加 ` [【设计稿】](url)`
- 若某条工作项在 `images` 中有匹配，在该条目下方插入配图，每张一行：`![alt](path)`，路径相对于周报文件所在目录（如 `assets/xxx.png`）

## 完整示例

**用户**：帮我总结下本周工作内容  
**假设当前日期**：2026-03-08

1. **日期范围**：T-6 ~ T-0 → 03-02 ~ 03-08
2. **月报文档**：03月工作
3. **拉取**：调用语雀 API 获取「03月工作」文档，提取 03-02 至 03-08 的工作记录
4. **配置**：读取 `zhoubao-design-links.json`，获取设计稿链接与配图映射
5. **输出**：按周报格式整理为「周报 | 03-02 ~ 03-08」，对匹配的工作项自动插入设计稿链接和配图

## 触发示例

| 用户输入 | 执行 |
| --- | --- |
| 帮我总结下本周工作内容 | 生成周报（默认 T-6 ~ T-0） |
| 帮我生成周报 | 生成周报（默认 T-6 ~ T-0） |
| 生成本周周报 | 生成周报（默认 T-6 ~ T-0） |
| 生成 03-01 到 03-07 的周报 | 生成周报（使用指定范围） |

## 依赖

- **语雀 skill**：拉取文档内容，见 `~/.claude/skills/lark/SKILL.md`
- **Cookie**：语雀需已登录，Cookie 位于 `~/.claude/yuque_cookies.txt`
