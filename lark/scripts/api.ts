import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as querystring from 'querystring';
import { fileURLToPath } from 'node:url';

export class LarkAPIError extends Error {
    constructor(public code: number | string, message: string, public body?: string) {
        super(`API Error ${code}: ${message}`);
        this.name = 'LarkAPIError';
    }
}

/** lark skill 根目录（含 package.json），与 scripts/ 同级 */
export function getLarkSkillRoot(): string {
    return path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
}

const COOKIE_AUTH_HINT =
    '在 lark skill 根目录执行: npm i && npx tsx scripts/auth.ts（Cookie 写入该目录下 .claude/yuque_cookies.txt）';

export class LarkClient {
    private BASE_URL = "https://yuque.antfin.com/api/v2";
    private cookie: string | null = null;
    private agent: https.Agent;

    constructor() {
        this.cookie = this.getCookieFromFile();
        this.agent = new https.Agent({
            rejectUnauthorized: false
        });
    }

    private readCookieFile(targetFile: string): string | null {
        if (!fs.existsSync(targetFile)) return null;
        try {
            const content = fs.readFileSync(targetFile, 'utf-8');
            const cookie = content
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line && !line.startsWith('#'))
                .join('');

            const timestampMatch = content.match(/# Updated at: (.+)/);
            if (timestampMatch) {
                const updateTime = new Date(timestampMatch[1]);
                const daysSinceUpdate = (Date.now() - updateTime.getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceUpdate > 7) {
                    console.warn(
                        `Warning: Cookie file is ${Math.floor(daysSinceUpdate)} days old. It may have expired.`
                    );
                }
            }

            return cookie;
        } catch {
            return null;
        }
    }

    private getCookieFromFile(): string | null {
        const skillRoot = getLarkSkillRoot();
        const candidates = [
            path.join(process.cwd(), '.claude', 'yuque_cookies.txt'),
            path.join(skillRoot, '.claude', 'yuque_cookies.txt'),
        ];
        for (const targetFile of candidates) {
            const cookie = this.readCookieFile(targetFile);
            if (cookie) return cookie;
        }
        return null;
    }

    private extractCsrfToken(cookieStr: string): string | null {
        if (!cookieStr) return null;
        const parts = cookieStr.split(';');
        let ctoken = null;
        let yuque_ctoken = null;

        for (const part of parts) {
            if (part.includes('=')) {
                const [key, val] = part.trim().split('=', 2);
                const trimmedKey = key.trim();
                if (trimmedKey === 'ctoken') {
                    ctoken = val;
                } else if (trimmedKey === 'yuque_ctoken') {
                    yuque_ctoken = val;
                }
            }
        }
        // Prefer ctoken for Antfin environment, fallback to yuque_ctoken
        return ctoken || yuque_ctoken;
    }

    public async request(
        endpoint: string,
        method: string = "GET",
        data?: any,
        params?: any,
        headerOverrides?: Record<string, string>
    ): Promise<any> {
        if (!this.cookie) {
            throw new Error(`未找到 Cookie 文件（已尝试 cwd 与 skill 根目录下的 .claude/yuque_cookies.txt）。\n\n${COOKIE_AUTH_HINT}`);
        }

        let url = endpoint.startsWith("http") ? endpoint : `${this.BASE_URL}${endpoint}`;

        if (params) {
            const queryStr = querystring.stringify(params);
            url += (url.includes('?') ? '&' : '?') + queryStr;
        }

        const headers: Record<string, string> = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Referer": "https://yuque.antfin.com/dashboard",
            "X-Requested-With": "XMLHttpRequest",
            "Cookie": this.cookie,
            "X-Csrf-Token": this.extractCsrfToken(this.cookie) || "unknown",
            ...(headerOverrides || {}),
        };

        // Debug info
        // console.error('DEBUG: URL:', url);
        // console.error('DEBUG: X-Csrf-Token:', headers['X-Csrf-Token']);
        // console.error('DEBUG: Cookie length:', this.cookie.length);

        const options: RequestInit & { agent?: any } = {
            method,
            headers,
            agent: this.agent
        } as any;

        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const requestOptions: https.RequestOptions = {
                method,
                headers,
                agent: this.agent,
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || 443,
                path: parsedUrl.pathname + parsedUrl.search
            };

            const req = https.request(requestOptions, (res: any) => {
                let body = '';
                res.on('data', (chunk: any) => body += chunk);
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            resolve(body); // Fallback to text if not JSON
                        }
                    } else {
                        let errorMsg = res.statusMessage || "Unknown Error";
                        try {
                            const errJson = JSON.parse(body);
                            if (errJson.message) errorMsg = errJson.message;
                        } catch (e) {
                            // ignore
                        }

                        // Special handling for authentication errors
                        if (res.statusCode === 401 || res.statusCode === 403) {
                            errorMsg = `${errorMsg}\n\nAuthentication failed. Your cookie may have expired.\n${COOKIE_AUTH_HINT}`;
                        }

                        reject(new LarkAPIError(res.statusCode || 0, errorMsg, body));
                    }
                });
            });

            req.on('error', (err: any) => {
                reject(new Error(`Network Error: ${err.message}`));
            });

            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
        });
    }
}

async function main() {
    const args = process.argv.slice(2);
    let method = "GET";
    let endpoint = "";
    let data = null;
    let params: any = {};

    // Basic CLI parser
    // Usage: npx tsx api.ts <METHOD> <ENDPOINT> [JSON_DATA] [--param=value ...]

    if (args.length < 2) {
        console.log("Usage: npx tsx api.ts <METHOD> <ENDPOINT> [JSON_BODY] [--param=val ...]");
        console.log("Example: npx tsx api.ts GET /user");
        console.log("Example: npx tsx api.ts GET /repos/demo/docs --limit=5");
        process.exit(1);
    }

    method = args[0].toUpperCase();
    endpoint = args[1];

    // Parse remaining args
    for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            // It's a query param
            const parts = arg.slice(2).split('=');
            const key = parts[0];
            const val = parts.length > 1 ? parts.slice(1).join('=') : "true";
            // Try to parse numbers
            if (!isNaN(Number(val)) && val !== "") {
                params[key] = Number(val);
            } else {
                params[key] = val;
            }
        } else if (arg.startsWith('{')) {
            // Assume it's JSON body
            try {
                data = JSON.parse(arg);
            } catch (e) {
                console.warn("Warning: Failed to parse JSON body arg, ignoring.");
            }
        }
    }

    const client = new LarkClient();

    try {
        // Construct full URL for /api/ endpoints
        let finalEndpoint = endpoint;
        if (endpoint.startsWith("/api/")) {
            finalEndpoint = `https://yuque.antfin.com${endpoint}`;
        }

        const resp = await client.request(finalEndpoint, method, data, params);

        // Output result
        console.log(JSON.stringify(resp, null, 2));

    } catch (e: any) {
        console.error(`Error: ${e.message || e}`);
        process.exit(1);
    }
}

const isCliEntry =
  process.argv[1] &&
  path.resolve(fileURLToPath(import.meta.url)) ===
    path.resolve(process.argv[1]!);
if (isCliEntry) {
  main();
}
