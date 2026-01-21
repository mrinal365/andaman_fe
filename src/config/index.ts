type AppEnv = 'local' | 'stage' | 'prod';

interface Config {
    apiUrl: string;
    env: AppEnv;
}

const local: Config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    env: 'local',
};

const stage: Config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://stage-api.example.com/api/v1',
    env: 'stage',
};

const prod: Config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com/api/v1',
    env: 'prod',
};

const configs: Record<AppEnv, Config> = {
    local,
    stage,
    prod,
};

const appEnv = (process.env.NEXT_PUBLIC_APP_ENV as AppEnv) || 'local';

export const config = configs[appEnv];
