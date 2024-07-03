import type {RenderParams} from '@gravity-ui/app-layout';

import type {AppEnvironment, AppInstallation, DLGlobalData, DLUser} from '../../../shared';
import {FALLBACK_LANGUAGES, Language, USER_SETTINGS_KEY} from '../../../shared';
import type {AppLayoutSettings, GetLayoutConfig} from '../../types/app-layout';
import {addTranslationsScript} from '../../utils/language';

import {getChartkitLayoutSettings, getPlatform} from './utils';

export const getOpensourceLayoutConfig: GetLayoutConfig = async (args) => {
    const {req, res, settingsId} = args;

    const config = req.ctx.config;
    const requestId = req.id || '';

    const getAppLayoutSettings = req.ctx.get('getAppLayoutSettings');

    const appLayoutSettings: AppLayoutSettings = getAppLayoutSettings(req, res, settingsId);

    const regionalEnvConfig = req.ctx.config.regionalEnvConfig;

    const allowLanguages = (regionalEnvConfig?.allowLanguages || FALLBACK_LANGUAGES) as Language[];

    const cookie = req.cookies[USER_SETTINGS_KEY];
    let lang = Language.Ru;
    let theme;
    try {
        const preparedCookie = JSON.parse(cookie);
        lang = preparedCookie.language;
        theme = preparedCookie.theme;
    } catch {
        console.warn('no userSettings in cookie');
    }

    const isAllowed = allowLanguages.includes(lang || '');
    if (!isAllowed) {
        lang = Language.Ru;
    }

    // TODO: check and remove optional props;
    const user: DLUser = {lang} as DLUser;
    const userSettings = {};
    const iamUserId = '';
    const {scripts: chartkitScripts, inlineScripts: chartkitInlineScripts} =
        getChartkitLayoutSettings(config.chartkitSettings);

    const DL: DLGlobalData = {
        user,
        userSettings,
        iamUserId,
        deviceType: getPlatform(req.headers['user-agent']),
        requestId,
        env: config.appEnv as AppEnvironment,
        installationType: config.appInstallation as AppInstallation,
        serviceName: config.serviceName,
        endpoints: config.endpoints.ui,
        features: config.features,
        meta: req.ctx.getMetadata(),
        chartkitSettings: config.chartkitSettings,
        allowLanguages,
        headersMap: req.ctx.config.headersMap,
        isZitadelEnabled: req.ctx.config.isZitadelEnabled,
        oidc: req.ctx.config.oidc,
        oidc_name: req.ctx.config.oidc_name,
        oidc_base_url: req.ctx.config.oidc_base_url,
        oidc_2: req.ctx.config.oidc_2,
        oidc_name_2: req.ctx.config.oidc_name_2,
        oidc_base_url_2: req.ctx.config.oidc_base_url_2,
        oidc_3: req.ctx.config.oidc_3,
        oidc_name_3: req.ctx.config.oidc_name_3,
        oidc_base_url_3: req.ctx.config.oidc_base_url_3,
        oidc_4: req.ctx.config.oidc_4,
        oidc_name_4: req.ctx.config.oidc_name_4,
        oidc_base_url_4: req.ctx.config.oidc_base_url_4,
        ...appLayoutSettings.DL,
    };
    const renderConfig: RenderParams<{DL: DLGlobalData}> = {
        nonce: req.nonce,
        data: {DL},
        lang,
        icon: {
            type: 'image/ico',
            href: config.faviconUrl,
            sizes: '32x32',
        },
        inlineScripts: ['window.DL = window.__DATA__.DL', ...chartkitInlineScripts],
        scripts: [addTranslationsScript({allowLanguages, lang}), ...chartkitScripts],
        links: [
            {
                href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
                rel: 'stylesheet',
            },
            {
                href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
                rel: 'stylesheet',
                integrity: 'sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH',
                crossOrigin: 'anonymous'
            },
            {
                href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js',
                integrity: 'sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy',
                crossOrigin: 'anonymous'
            }
        ],
        bodyContent: {
            theme,
        },
        pluginsOptions: {
            layout: {name: appLayoutSettings.bundleName},
        },
        ...appLayoutSettings.renderConfig,
    };

    return renderConfig;
};
