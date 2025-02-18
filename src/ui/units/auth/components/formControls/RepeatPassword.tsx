import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {PasswordInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../store/actions/userInfoForm';
import {selectRepeatPassword} from '../../store/selectors/userInfoForm';

import type {UserFormInputProps} from './types';

import './formControls.scss';

const b = block('user-info-form-controls');

// TODO: add title to translations
// const i18n = I18n.keyset('auth.user-form-controls.view');
const i18n = (key: string) => {
    switch (key) {
        case 'label_repeat-password':
            return 'Repeat Password';
        default:
            return key;
    }
};

export const RepeatPassword = (props: Omit<UserFormInputProps, 'autocomplete'>) => {
    const dispatch = useDispatch();

    const repeatPassword = useSelector(selectRepeatPassword);

    const handleUpdate = (value: string) => dispatch(updateFormValues({repeatPassword: value}));

    return (
        <FormRow label={i18n('label_repeat-password')} className={b('row', props.rowClassName)}>
            <PasswordInput
                autoComplete="disable"
                value={repeatPassword}
                onUpdate={handleUpdate}
                hideCopyButton={true}
                {...props}
            />
        </FormRow>
    );
};
