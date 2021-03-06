import React, { Component } from 'react';
import { SubmissionError } from 'redux-form';
import { updateUserData, approveBank, rejectBank } from './actions';
import { Card, Button, Input, Popconfirm, Icon, message, Col, Row } from 'antd';
import { ModalForm } from '../../../components';

const Form = ModalForm('BANK_DATA', 'bank_data');

const BankFields = {
	bank_name: {
		type: 'text',
		label: 'Bank Name'
	},
	account_number: {
		type: 'text',
		label: 'Account Number'
	},
	card_number: {
		type: 'text',
		label: 'Card Number'
	}
};

const Fields = {
	...BankFields
};

// const generateInitialValues = (initialValues) => {
// 	const values = {
// 		...initialValues
// 	};
// 	return values;
// };

class BankData extends Component {
	constructor() {
		super();
		this.state = {
			bank: [],
			formVisible: false,
			note: ''
		};
	}

	componentWillMount() {
		let bank = [];
		if (
			this.props.initialValues.bank_account &&
			this.props.initialValues.bank_account.length > 0 &&
			this.props.initialValues.bank_account[0].bank_name !== ''
		) {
			bank = this.props.initialValues.bank_account;
		}
		this.setState({
			bank,
			userId: this.props.initialValues.id
		});
	}

	onCancel = () => {
		this.setState({ formVisible: false });
	};

	onSubmit = (onChangeSuccess, bank, userId) => (values) => {
		let bank_account = bank;
		values.id = values.account_number + '-man';
		values.status = 3;
		bank_account.push(values);
		const submitData = {
			id: userId,
			bank_account
		};
		return updateUserData(submitData)
			.then((data) => {
				this.closeModal();
				if (onChangeSuccess) {
					onChangeSuccess({
						...values,
						...submitData,
						...data
					});
				}
			})
			.catch((err) => {
				message.error('error');
				throw new SubmissionError({ _error: err.data.message });
			});
	};

	showModal = () => {
		this.setState({ formVisible: true });
	};
	closeModal = () => {
		this.setState({ formVisible: false });
	};

	handleNoteChange = (event) => {
		this.setState({ note: event.target.value });
	};

	deleteBank = (id) => {
		const { bank, userId } = this.state;
		const newBanks = bank.filter((b) => {
			return b.id !== id;
		});
		this.setState({ bank: newBanks });
		const submitData = {
			id: userId,
			bank_account: newBanks
		};
		updateUserData(submitData)
			.then((data) => {
				message.success('Bank deleted');
			})
			.catch((err) => {
				message.error('error');
				// throw new SubmissionError({ _error: err.data.message });
			});
	};

	approveBank = (values) => {
		// const newBanks = this.state.bank.filter((b) => {
		// 	return b.id !== values.bank_id;
		// });
		approveBank(values)
			.then((data) => {
				message.success('Bank approved');
			})
			.catch((err) => {
				message.error('error');
				// throw new SubmissionError({ _error: err.data.message });
			});
	};

	rejectBank = (values) => {
		const newBanks = this.state.bank.filter((b) => {
			return b.id !== values.bank_id;
		});
		this.setState({ bank: newBanks });
		rejectBank(values)
			.then((data) => {
				message.success('Bank rejected');
			})
			.catch((err) => {
				message.error('error');
				// throw new SubmissionError({ _error: err.data.message });
			});
	};

	render() {
		const { bank, formVisible, userId } = this.state;
		const { onChangeSuccess } = this.props;
		let disabled = false;
		return (
			<Row>
				{bank && bank.length <= 3 ? (disabled = false) : (disabled = true)}
				<Button
					disabled={disabled}
					onClick={() => this.showModal()}
					type="primary"
					icon="plus-circle"
					size="small"
				>
					Add bank
				</Button>
				<Form
					onSubmit={this.onSubmit(onChangeSuccess, bank, userId)}
					onCancel={this.onCancel}
					title="Add a new bank"
					fields={Fields}
					visible={formVisible}
				/>
				<Row gutter={16}>
					{bank.map((bank) => {
						return (
							<Col style={{ margin: '1em' }}>
								<Card
									key={bank.id || bank.bank_name}
									title={bank.bank_name}
									extra={
										bank.status === 1 ? (
											<div style={{ width: '10em' }}>
												<div>
													<Button
														onClick={() =>
															this.approveBank({
																user_id: userId,
																bank_id: bank.id
															})
														}
														type="primary"
														icon="check"
														size={10}
													>
														Accept
													</Button>
												</div>
												<div>
													<Button
														onClick={() =>
															this.rejectBank({
																user_id: userId,
																bank_id: bank.id,
																message: this.state.note
															})
														}
														type="danger"
														icon="close"
														size={10}
													>
														Reject
													</Button>
													<Input.TextArea
														rows={4}
														value={this.state.note}
														onChange={this.handleNoteChange}
													/>
												</div>
											</div>
										) : (
											<Popconfirm
												title="Are you sure delete this task?"
												onConfirm={() => this.deleteBank(bank.id)}
												okText="Yes"
												cancelText="No"
											>
												<Icon
													type="delete"
													style={{
														fontSize: '20px',
														color: '#08c'
													}}
													theme="outlined"
												/>
											</Popconfirm>
										)
									}
									style={{ width: 300 }}
								>
									<p>{bank.bank_name}</p>
									<p>{bank.account_number}</p>
									<p>{bank.card_number}</p>
								</Card>
							</Col>
						);
					})}
				</Row>
			</Row>
		);
	}
}

export default BankData;
