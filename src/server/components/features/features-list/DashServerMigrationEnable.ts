import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.DashServerMigrationEnable,
    state: {
        development: true,
        production: false,
    },
});
