import React from 'react';
import { SubmissionError } from 'redux-form';
import { activateUser } from './actions';
import { AdminHocForm } from '../../../components';

const Form = AdminHocForm('ACTIVATION_FORM');

const onSubmit = (refreshData) => (values) => {
	return activateUser(values)
		.then((res) => {
			refreshData(values);
		})
		.catch((err) => {
			throw new SubmissionError({ _error: err.data.message });
		});
};

const OTP = ({ user_id, activated, refreshData }) => (
	<Form
		onSubmit={() => onSubmit(refreshData)({ user_id, activated: !activated })}
		buttonText={activated ? 'Deactivate' : 'Activate'}
	/>
);

export default OTP;
