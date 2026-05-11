/**
 * 优先从当前文档 API 拉取 Lake；若 content 为空则回退到指定历史版本。
 * 在顶部插入 OBCLOUD 调研总结，写入用户主目录下 .lake.txt（不调用 PUT，避免语雀接口不落库）。
 *
 * 用法：在 lark skill 根目录执行：npx tsx scripts/write-merged-summary-local.ts [回退版本ID]
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "node:url";
import { LarkClient } from "./api";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TITLE = "数据库厂商Skills能力调研";
const SLUG = "hm76x6i4u0n0azbn";
const BOOK_ID = 38169;
const VERSION_FALLBACK = process.argv[2] || "3338637494";
const OUT = path.join(
  process.env.HOME || "/Users/yixiuzhu",
  "yuque-数据库厂商Skills能力调研-含调研总结.lake.txt"
);

function summaryLake(): string {
  const h2 =
    '<h2 data-lake-id="obc-sum-h2" id="obc-sum-h2">调研总结（面向 OBCLOUD Agent Skill 规划 · 产品与设计师版）</h2>';
  const intro = `<p data-lake-id="obc-sum-p1" id="obc-sum-p1"><strong>读者与用途</strong>：供产品与体验设计同学在规划 <strong>OBCLOUD</strong>「面向 Agent 的 Skill 能力」时对照。OBCLOUD 已具备云数据库实例与架构、迁移与校验、生命周期管理、MaaS、AI 工具链（文档解析、分块、通用/结构化抽取等）及生态集成；下一阶段关键是<strong>将平台能力封装为可被 Agent 稳定编排的 Skill</strong>（及必要的 MCP），本文竞品章节提供外部环境扫描。</p>`;
  const scope = `<p data-lake-id="obc-sum-p2" id="obc-sum-p2"><strong>正文样本范围</strong>（与下文「竞品调研范围」一致）：国内 <strong>Agent 基础设施与数据库内嵌 AI</strong>（AgentBay Skill 套件、PolarDB AI / polarclaw、LakeBase）；<strong>MongoDB</strong> 以控制台开发者工具聚合 MCP；向量侧 <strong>Pinecone</strong>（Canopy 式整包 Skill 已弃用，当前以 MCP 工具为主）及 <strong>Qdrant Cloud</strong> 等在材料中涉及的 onboarding 体验；<strong>Supabase</strong> 的 Skill + MCP 双轨与多触点拨出、权限分端点等。</p>`;
  const criteria = `<p data-lake-id="obc-sum-p3" id="obc-sum-p3"><strong>「系统化 Skill」三层次</strong>（便于对齐内部 roadmap）：①<strong>可发现 / 可安装</strong>——市场或 CLI 能定位包名、版本与依赖；②<strong>可编排 / 可治理</strong>——工具面、权限与租户/项目边界可核验；③<strong>与主叙事一致</strong>——与「Agent / AI 后端 / 数据平台」共用控制台 IA 与话术，而非孤立的说明页。</p>`;
  const observations = `<p data-lake-id="obc-sum-p4" id="obc-sum-p4"><strong>分形态观察（与正文材料对应）</strong></p><ul list="obc-sum-ul1" class="lake-list"><li data-lake-id="obc-sum-li1" id="obc-sum-li1" class="lake-list-node lake-list-order"><span data-lake-id="obc-sum-s1" id="obc-sum-s1"><strong>Agent 运行时 + Skill 中心（如 AgentBay）</strong>：突出执行环境与 Skill 目录，并以 <strong>find-skills</strong> 类能力降低单点安装成本——体现「扩展单元平台化」。</span></li><li data-lake-id="obc-sum-li2" id="obc-sum-li2" class="lake-list-node lake-list-order"><span data-lake-id="obc-sum-s2" id="obc-sum-s2"><strong>控制台内嵌 AI + Skill 市场（如 PolarDB AI）</strong>：在数据库用户动线上嵌入 polarclaw 与 skills 市场；正文亦指出<strong>仅列表、详情与安装说明不足</strong>时，用户难以建立信任——对设计侧是「闭环与可信度」反例。</span></li><li data-lake-id="obc-sum-li3" id="obc-sum-li3" class="lake-list-node lake-list-order"><span data-lake-id="obc-sum-s3" id="obc-sum-s3"><strong>开发者工具聚合 MCP（如 MongoDB）</strong>：控制台<strong>更多工具 → MCP Server 与客户端</strong>，能力拆成连接、用户、集群、项目等<strong>原子工具面</strong>，适合作为数据库云 MCP 第一站的对标。</span></li><li data-lake-id="obc-sum-li4" id="obc-sum-li4" class="lake-list-node lake-list-order"><span data-lake-id="obc-sum-s4" id="obc-sum-s4"><strong>向量厂商：大 Skill 包让位给 MCP（如 Pinecone）</strong>：Canopy 式整包 RAG Skill <strong>已弃用</strong>，现以 <code data-lake-id="obc-sum-c1" id="obc-sum-c1">upsert_context</code> / <code data-lake-id="obc-sum-c2" id="obc-sum-c2">query_namespace</code> 等 MCP 为主——提示宜<strong>慎用「全能单包」</strong>，优先原子能力 + 官方推荐编排文档。</span></li><li data-lake-id="obc-sum-li5" id="obc-sum-li5" class="lake-list-node lake-list-order"><span data-lake-id="obc-sum-s5" id="obc-sum-s5"><strong>Skill + MCP 双轨（如 Supabase）</strong>：IDE 市场安装 Skill，同时 Connect / 搜索 / 文档多触点拨出 MCP；材料提及<strong>免 PAT、浏览器授权、按权限拆分 mcp.json 端点</strong>——可借鉴为「同一后端、两条消费协议」的信息架构与合规叙事。</span></li></ul>`;
  const common = `<p data-lake-id="obc-sum-p5" id="obc-sum-p5"><strong>共性</strong>：市场或 CLI 降低接入成本；工具面偏<strong>原子化</strong>；普遍强调<strong>连接后验收</strong>（如自然语言试调 MCP）；身份与组织/项目 scope 叙述一致。</p><p data-lake-id="obc-sum-p6" id="obc-sum-p6"><strong>差异</strong>：叙事重心在「Agent 云基础设施」vs「数据/运维原子工具」vs「控制台内 AI」；存在 <strong>Skill 套件收缩、MCP 加深</strong> 的路径分化；市场在<strong>仅有列表</strong>与<strong>详情 + 安装 + 验证全链路</strong>之间的体验差距显著。</p>`;
  const takeaways = `<p data-lake-id="obc-sum-p7" id="obc-sum-p7"><strong>对 OBCLOUD 的可执行启示</strong></p><ul list="obc-sum-ul2" class="lake-list"><li data-lake-id="obc-sum-lt1" id="obc-sum-lt1" class="lake-list-node lake-list-order"><span data-lake-id="obc-sum-t1" id="obc-sum-t1"><strong>分层交付</strong>：迁移、校验、文档 AI、MaaS 等拆为可单独声明的 Skill，再提供推荐组合，控制「大一统包」的维护与边界模糊。</span></li><li data-lake-id="obc-sum-lt2" id="obc-sum-lt2" class="lake-list-node lake-list-order"><span data-lake-id="obc-sum-t2" id="obc-sum-t2"><strong>控制台 IA</strong>：增设 <strong>开发者工具 / Agent 连接 / Skill 目录</strong> 等与实例、AI 工具并列的一级入口，缩短心智路径。</span></li><li data-lake-id="obc-sum-lt3" id="obc-sum-lt3" class="lake-list-node lake-list-order"><span data-lake-id="obc-sum-t3" id="obc-sum-t3"><strong>市场详情页标准</strong>：每 Skill 固定包含<strong>场景、前置条件（版本/权限）、安装方式、一条最小验收用例</strong>，避免「只见列表难落地」。</span></li><li data-lake-id="obc-sum-lt4" id="obc-sum-lt4" class="lake-list-node lake-list-order"><span data-lake-id="obc-sum-t4" id="obc-sum-t4"><strong>双轨预研</strong>：Skill（IDE/人类打包体验）与 MCP（通用协议）共用<strong>能力 ID 与权限模型</strong>，文案与文档同构。</span></li><li data-lake-id="obc-sum-lt5" id="obc-sum-lt5" class="lake-list-node lake-list-order"><span data-lake-id="obc-sum-t5" id="obc-sum-t5"><strong>首成功路径</strong>：明确 OBCLOUD 的 onboarding（例如绑定实例后跑通一次解析/迁移/校验类任务），参考材料中「少跳转、关键凭证与端点首屏可见」的体验。</span></li><li data-lake-id="obc-sum-lt6" id="obc-sum-lt6" class="lake-list-node lake-list-order"><span data-lake-id="obc-sum-t6" id="obc-sum-t6"><strong>治理前置</strong>：Skill 详情页固定<strong>权限边界、审计、成本与数据范围</strong>模块，与平台级合规故事对齐。</span></li></ul>`;
  const note = `<p data-lake-id="obc-sum-p8" id="obc-sum-p8"><strong>说明</strong>：本模块归纳自正文《${TITLE}》当前内容；正文增补样本或结论时，请同步审视上述判断。以下为正文原有结构。</p><hr data-lake-id="obc-sum-hr" id="obc-sum-hr" />`;

  return h2 + intro + scope + criteria + observations + common + takeaways + note;
}

async function main() {
  const c = new LarkClient();
  const live = await c.request(
    `https://yuque.antfin.com/api/docs/${SLUG}`,
    "GET",
    undefined,
    { book_id: BOOK_ID }
  );
  let orig = live.data?.content as string;
  let source = "live";
  if (!orig || orig.length < 100) {
    const v = await c.request(
      `https://yuque.antfin.com/api/doc_versions/${VERSION_FALLBACK}`,
      "GET"
    );
    orig = v.data.content as string;
    source = `version:${VERSION_FALLBACK}`;
  }
  const anchor = '<meta name="paragraphSpacing" content="relax" />';
  const pos = orig.indexOf(anchor);
  if (pos === -1) {
    throw new Error("版本正文中未找到 paragraphSpacing meta");
  }
  const merged =
    orig.slice(0, pos + anchor.length) +
    summaryLake() +
    orig.slice(pos + anchor.length);
  fs.writeFileSync(OUT, merged, "utf8");
  console.log(
    JSON.stringify(
      {
        ok: true,
        source,
        out: OUT,
        bytes: merged.length,
        hint: "请在语雀编辑页将本文顶部插入模块：若线上正文异常，可先从「历史版本」恢复含正文的版本，再全选粘贴 Lake 源码或使用导入能力（若有）。",
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
