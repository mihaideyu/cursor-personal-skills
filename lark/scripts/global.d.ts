// Minimal type definitions for Node.js to avoid npm install @types/node

declare var process: {
    env: { [key: string]: string | undefined };
    argv: string[];
    exit(code?: number): void;
    cwd(): string;
    stdout: any;
    stderr: any;
    platform: string;
};

declare var __dirname: string;
declare var __filename: string;

declare module 'fs' {
    export function existsSync(path: string): boolean;
    export function readFileSync(path: string, encoding?: string): string;
    export function writeFileSync(path: string, content: string, encoding?: string): void;
}

declare module 'path' {
    export function join(...paths: string[]): string;
    export function resolve(...paths: string[]): string;
    export function dirname(path: string): string;
}

declare module 'querystring' {
    export function stringify(obj: any): string;
    export function parse(str: string): any;
}

declare module 'https' {
    export class Agent {
        constructor(options?: any);
    }
    export interface RequestOptions {
        method?: string;
        headers?: any;
        agent?: any;
        hostname?: string;
        port?: number | string;
        path?: string;
    }
    export function request(options: RequestOptions | string, callback?: (res: any) => void): any;
}

declare class URL {
    constructor(url: string);
    hostname: string;
    port: string;
    pathname: string;
    search: string;
}

declare var console: {
    log(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
};
