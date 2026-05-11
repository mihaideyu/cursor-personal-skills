---
name: monthly-report
description: Generates monthly work reports from Yuque "XX月工作" and/or workspace weekly MDs; four-part structure (业务、OBCloud易用性升级、OAgent、团队)；no invented facts; professional plain style. Use for 月报, monthly report, 生成本月/某月月报, 根据语雀月总结工作.
---

# 月报生成 Skill

根据指令日期确定目标月份，通过 **lark（语雀）skill** 在指定知识库目录下定位 **「XX月工作」** 文档，抽取其中所有 **「第 x 周周报」** 章节（及用户授权的工作区周报文件），合并提炼为月报；**小节表述规则与周报一致**，**一级标题与分块**按 [references/yuebao_format.md](references/yuebao_format.md) 中的**四块结构**执行。

## 执行流程

### 1. 确定目标月份

- **默认**：取用户发出指令时的日期所在**自然月**（当前年 + 当前月）。
- **用户指定**：若用户明确「2 月」「2026-03」「去年 12 月」等，以用户指定为准推算 `{YYYY, MM}`。
- **文档名**：`{MM}月工作`，**两位补零**（`01月工作` … `12月工作`）。

### 2. 拉取「XX月工作」全文

- **知识库目录**：[2026 年目录](https://yuque.antfin.com/yixiu.zyx/bc447s/eiaor4zeuls16ifq)（namespace `yixiu.zyx`，book `bc447s`）。
- **操作步骤**：见 [references/yuque_monthly_doc.md](references/yuque_monthly_doc.md)（`book_id`、`slug` 获取、`GET /api/docs/:slug`）。
- **认证**：在用户主目录 `~` 执行 API 脚本；Cookie 见 `~/.claude/yuque_cookies.txt`；401 时运行 `npx tsx .claude/skills/lark/scripts/auth.ts`。

### 3. 提取「第 x 周周报」章节

- **匹配标题**：如 `第1周周报`、`第2 周周报`（允许空格、中文数字等变体），详见 [references/extract_weekly_sections.md](references/extract_weekly_sections.md)。
- **输入范围**：**仅**各周周报章节内容；文档中纯按日流水、若未纳入任何「第 x 周周报」块，则默认**不**作为月报素材（除非用户额外要求用日报补充，如指定日期）。
- **小节映射（归入四块）**：语雀周报内「业务重点 / OBCloud」→ **一、OBCloud 业务支持**；**易用性升级、私网连接（设计主导专项）、控制台体验治理、指标与 POC 路径**等 → **二、OBCloud易用性升级**（其下三条**顺序固定**：**易用性升级路径规划** → **易用性专项问题优化** → **易用性类问题打磨**）；**OAgent（云上/云下）、原 OBClaw 控制台与智能体相关迭代、支撑性设计工程化（若与 OAgent 出稿强相关）** → **三、OAgent**；会议、目标对齐、招聘等 → **四、团队与其它**。若无二级标题，则对整段做主题归纳后填入对应块。

### 4. 读取配图与设计稿配置（可选）

若工作区存在 `工作总结/.cursor/zhoubao-design-links.json`：按 [references/yuebao_format.md](references/yuebao_format.md) 在**正文已出现且名称可匹配**的条目末尾追加设计稿链接与 `assets/` 配图；**无匹配条目时不要强行插入**无关 Figma。

### 5. 生成月报

- **一级结构（四块，顺序固定）**：见 [references/yuebao_format.md](references/yuebao_format.md)「一级结构与命名」。
- **格式对齐**：列表、不加具体日期、需求前【VX】迭代标识、整合句而非流水等，与 `工作总结/.cursor/rules/zhoubao-format.mdc` 及周报 skill 的 `references/zhoubao_format.md` **一致**（除一级标题名称与分块外）。
- **表述深度**：重点在一条内用**连贯书面语**写清来龙去脉与结论；**不在正文使用「背景」「过程」「结果」等显性小标题**打断阅读，逻辑自然融入。价值判断须能从源文推出；非重点从简。
- **合并策略**：跨周同一主题合并为一条，结论优先、保留关键过程与分工，避免按周复述。
- **节后待办与排期**：若与上文某块强相关（如云下稿面节后评审、易用性文档节后对齐、某版本节后验收），**写入对应段落末尾**，**不在「四、团队与其它」中单列「节后待办」**，除非仅为纯行政提醒且无归属块。

#### 5.1 内容忠实度（必填）

- **禁止随意发挥**：不编造、不推断、不增补原材料中**未出现**的事实、结论、数据、评价或责任人。
- **来源边界**：正文以语雀「MM月工作」中各 **「第 x 周周报」** 为主；用户明确授权时，可合并工作区内 **`周报_*.md`** 等素材，但**月报正文不露出本地周报文件链接**（见 yuebao_format 链接规则）。
- **概括限度**：只能基于源文紧缩复述或概括，不得主观拔高、不写无依据口号。

#### 5.2 表达风格（必填）

月报全文须 **专业、精炼、平实**，且在**可读与精简**之间平衡：信息要够读者理解，避免过度压缩导致语义跳跃。

详见 [references/yuebao_format.md](references/yuebao_format.md)「内容忠实度与文风」。

### 6. 输出

- 建议保存为 `工作总结/月报_YYYY年MM月.md`（或用户指定路径）。
- 若当月文档不存在、或无「第 x 周周报」可解析，在产出中如实说明并列出缺失项。

## 触发示例

| 用户输入 | 行为 |
| --- | --- |
| 帮我生成本月月报 | 当前年月的「MM月工作」→ 汇总各周周报 → 四块月报 |
| 生成 2026 年 3 月月报 | 指定 2026-03 月文档与周报素材 |
| 根据语雀总结上月工作 | 目标月为上一自然月 |

## 依赖

- **语雀**：`~/.claude/skills/lark/SKILL.md`
- **周报格式**：`工作总结/.cursor/rules/zhoubao-format.mdc`（若存在）
