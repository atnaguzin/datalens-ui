import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.UseMovePermAction,
    state: {
        development: true,
        production: true,
    },
});
