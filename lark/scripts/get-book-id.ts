import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'node:url';

const skillRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export class YuqueHTMLParser {
    private cookie: string | null = null;
    private agent: https.Agent;

    constructor() {
        this.cookie = this.getCookieFromFile();
        this.agent = new https.Agent({
            rejectUnauthorized: false
        });
    }

    private getCookieFromFile(): string | null {
        const candidates = [
            path.join(process.cwd(), '.claude', 'yuque_cookies.txt'),
            path.join(skillRoot, '.claude', 'yuque_cookies.txt'),
        ];
        for (const targetFile of candidates) {
            if (!fs.existsSync(targetFile)) continue;
            try {
                const content = fs.readFileSync(targetFile, 'utf-8');
                const cookie = content
                    .split('\n')
                    .map((line) => line.trim())
                    .filter((line) => line && !line.startsWith('#'))
                    .join('');
                if (cookie) return cookie;
            } catch {
                // ignore
            }
        }
        return null;
    }

    /**
     * 从 Yuque URL 中提取 book_id
     * @param url Yuque 文档 URL，如 https://yuque.antfin.com/antcode/help/zxia4g
     * @returns book_id
     */
    public async extractBookId(url: string): Promise<string | null> {
        if (!this.cookie) {
            throw new Error(
                'Cookie not found. 在 lark skill 根目录执行: npm i && npx tsx scripts/auth.ts'
            );
        }

        return new Promise((resolve, reject) => {
            const options: https.RequestOptions = {
                method: 'GET',
                headers: {
                    'Cookie': this.cookie,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
                },
                agent: this.agent
            };

            https.get(url, options, (res) => {
                let html = '';

                res.on('data', (chunk) => {
                    html += chunk;
                });

                res.on('end', () => {
                    // 尝试多种模式提取 book_id
                    const patterns = [
                        /book_id:\s*'(\d+)'/,
                        /book_id:\s*"(\d+)"/,
                        /"book_id":\s*"(\d+)"/,
                        /"bookId":\s*"(\d+)"/,
                        /book_id=(\d+)/,
                        /book_id%22[^0-9]*[0-9]*/ // fallback
                    ];

                    for (const pattern of patterns) {
                        const match = html.match(pattern);
                        if (match && match[1]) {
                            console.error(`Found book_id: ${match[1]}`);
                            resolve(match[1]);
                            return;
                        }
                    }

                    // 如果上面的模式都没匹配到，尝试更宽松的搜索
                    const fallbackMatch = html.match(/book_id[^0-9]*([0-9]{6,})/);
                    if (fallbackMatch && fallbackMatch[1]) {
                        console.error(`Found book_id (fallback): ${fallbackMatch[1]}`);
                        resolve(fallbackMatch[1]);
                        return;
                    }

                    reject(new Error("book_id not found in HTML. Please check if the URL is correct."));
                });
            }).on('error', (err) => {
                reject(new Error(`Failed to fetch HTML: ${err.message}`));
            });
        });
    }
}

// CLI 接口
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Usage: npx tsx scripts/get-book-id.ts <YUQUE_URL>');
        console.error('（请在 lark skill 根目录执行，与 package.json 同级）');
        console.error('');
        console.error('Example:');
        console.error('  npx tsx scripts/get-book-id.ts https://yuque.antfin.com/antcode/help/zxia4g');
        process.exit(1);
    }

    const url = args[0];
    const parser = new YuqueHTMLParser();

    try {
        const bookId = await parser.extractBookId(url);
        console.log(bookId);
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Run main
main();
