import type {AppContext} from '@gravity-ui/nodekit';
import {isObject, isString} from 'lodash';

import {
    CONNECTIONS_DASHSQL,
    CONNECTIONS_TYPED_QUERY_RAW_URL,
    CONNECTION_ID_PLACEHOLDER,
    DATASET_DISTINCTS_URL,
    DATASET_FIELDS_URL,
    DATASET_ID_PLACEHOLDER,
    DATASET_RESULT_URL,
} from '../../../../modes/charts/plugins/control/url/constants';
import type {
    APIConnectorParams,
    Source,
    SourceWithAPIConnector,
    SourceWithDatasetId,
    SourceWithQLConnector,
} from '../../types';

export const isAPIConnectorSource = (source: Source): source is SourceWithAPIConnector => {
    return isString(source.apiConnectionId) && isString(source.method) && isString(source.path);
};

export const getApiConnectorParamsFromSource = (
    source: SourceWithAPIConnector,
): APIConnectorParams => {
    const originalSource = source._original;
    if (
        !(
            isObject(originalSource) &&
            'method' in originalSource &&
            isString(originalSource.method) &&
            'path' in originalSource &&
            isString(originalSource.path)
        )
    ) {
        throw new Error('ApiConnector source is not prepared');
    }

    const result: APIConnectorParams = {
        method: originalSource.method,
        body: {},
        path: originalSource.path,
    };

    if (originalSource.method === 'POST' && 'body' in originalSource) {
        result.body = originalSource.body;
        result.content_type = isString(originalSource.body)
            ? 'text/plain;charset=utf-8'
            : 'application/json';
    }

    return result;
};

export const prepareSourceWithAPIConnector = (source: SourceWithAPIConnector) => {
    source._original = {...source};
    const sourceUrl = CONNECTIONS_TYPED_QUERY_RAW_URL.replace(
        CONNECTION_ID_PLACEHOLDER,
        encodeURIComponent(source.apiConnectionId),
    );
    source.url = sourceUrl;
    source.method = 'POST';
    return source;
};

export const isQLConnectionSource = (source: Source): source is SourceWithQLConnector => {
    return isString(source.qlConnectionId) && isObject(source.data);
};

export const prepareSourceWithQLConnection = (source: SourceWithQLConnector) => {
    const sourceUrl = CONNECTIONS_DASHSQL.replace(
        CONNECTION_ID_PLACEHOLDER,
        encodeURIComponent(source.qlConnectionId),
    );
    source.url = sourceUrl;
    source.method = 'POST';
    return source;
};

export const isDatasetSource = (source: Source): source is SourceWithDatasetId => {
    return isString(source.datasetId);
};

export const prepareSourceWithDataset = (source: SourceWithDatasetId) => {
    const urlPath =
        isObject(source) && 'path' in source && isString(source.path) ? source.path : 'result';

    let template: string;
    let method: 'POST' | 'GET';
    switch (urlPath) {
        case 'result': {
            template = DATASET_RESULT_URL;
            method = 'POST';
            break;
        }
        case 'values/distinct': {
            template = DATASET_DISTINCTS_URL;
            method = 'POST';
            break;
        }
        case 'fields': {
            template = DATASET_FIELDS_URL;
            method = 'GET';
            break;
        }
        default: {
            throw Error('Wrong path');
        }
    }

    const sourceUrl = template.replace(
        DATASET_ID_PLACEHOLDER,
        encodeURIComponent(source.datasetId),
    );

    source.url = sourceUrl;
    source.method = method;
    return source;
};

export const prepareSource = (source: Source, ctx: AppContext): Source => {
    if (isObject(source)) {
        let validSource = true;

        switch (true) {
            case isString(source.apiConnectionId):
                if (isAPIConnectorSource(source)) {
                    source = prepareSourceWithAPIConnector(source);
                } else {
                    ctx.logError('FETCHER_INCORRECT_API_CONNECTOR_SPECIFICATION', null, {
                        apiConnectionId: source.apiConnectionId,
                    });
                    validSource = false;
                }
                break;

            case isString(source.qlConnectionId):
                if (isQLConnectionSource(source)) {
                    source = prepareSourceWithQLConnection(source);
                } else {
                    ctx.logError('FETCHER_INCORRECT_QL_CONNECTION_SPECIFICATION', null, {
                        qlConnectionId: source.qlConnectionId,
                    });
                    validSource = false;
                }
                break;

            case isString(source.datasetId):
                if (isDatasetSource(source)) {
                    source = prepareSourceWithDataset(source);
                } else {
                    ctx.logError('FETCHER_INCORRECT_DATASET_SPECIFICATION', null, {
                        datasetId: source.datasetId,
                    });
                    validSource = false;
                }
                break;

            default:
                break;
        }

        if (!validSource) {
            throw new Error('Wrong source specification');
        }
    }
    return source;
};
