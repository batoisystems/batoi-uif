import '@batoi/uif-ai';
import '@batoi/uif-components';
import '@batoi/uif-core';
import '@batoi/uif-dom';
import '@batoi/uif-icons';
import '@batoi/uif-mcp';
import '@batoi/uif-net';
import '@batoi/uif-actions';
import '@batoi/uif-charts';
import '@batoi/uif-dashboard';
import '@batoi/uif-desktop';
import '@batoi/uif-editor';
import '@batoi/uif-effects';
import '@batoi/uif-extension-kit';
import '@batoi/uif-forms';
import '@batoi/uif-mobile';
import '@batoi/uif-overlays';
import '@batoi/uif-push';
import '@batoi/uif-pwa';
import '@batoi/uif-query';
import '@batoi/uif-rad-adapter';
import '@batoi/uif-realtime';
import '@batoi/uif-router';
import '@batoi/uif-state';
import '@batoi/uif-table';

type UIFProfileName = 'all' | 'rad' | 'dashboard' | 'mobile' | 'desktop' | 'agent';
interface UIFProfileDefinition {
    name: UIFProfileName;
    version: 3;
    entryPoint: string;
    packages: readonly string[];
    purpose: string;
}
declare const uifProfiles: Readonly<{
    all: Readonly<UIFProfileDefinition>;
    rad: Readonly<UIFProfileDefinition>;
    dashboard: Readonly<UIFProfileDefinition>;
    mobile: Readonly<UIFProfileDefinition>;
    desktop: Readonly<UIFProfileDefinition>;
    agent: Readonly<UIFProfileDefinition>;
}>;
declare function getUIFProfile(name: UIFProfileName): Readonly<UIFProfileDefinition>;

export { type UIFProfileDefinition, type UIFProfileName, getUIFProfile, uifProfiles };
