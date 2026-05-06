import { chatConfig } from './chatConfig';

export const featureFlags = chatConfig;
export type FeatureKey = keyof typeof chatConfig.comingSoon;
