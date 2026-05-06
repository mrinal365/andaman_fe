import { chatConfig } from './chatConfig';

export type AppEnv = 'local' | 'stage' | 'prod';

interface Config {
    env: AppEnv;
    api: {
        baseUrl: string;
        timeout: number;
    };
    app: {
        name: string;
        version: string;
    };
    chat: typeof chatConfig;
}

const commonDefaults = {
    api: {
        timeout: 10000,
    },
    app: {
        name: 'Andaman',
        version: '1.0.0',
    },
    chat: chatConfig,
};

const local: Config = {
    env: 'local',
    ...commonDefaults,
    api: {
        ...commonDefaults.api,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    },
};

const stage: Config = {
    env: 'stage',
    ...commonDefaults,
    api: {
        ...commonDefaults.api,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://andaman-be.vercel.app/api',
    },
};

const prod: Config = {
    env: 'prod',
    ...commonDefaults,
    api: {
        ...commonDefaults.api,
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://andaman-be.vercel.app/api',
    },
};

const configs: Record<AppEnv, Config> = {
    local,
    stage,
    prod,
};

const appEnv = (process.env.NEXT_PUBLIC_APP_ENV as AppEnv) || 'local';

export const config = configs[appEnv];
