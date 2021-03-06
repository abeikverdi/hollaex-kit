import React from 'react';
import ReactSvg from 'react-svg';
import classnames from 'classnames';
import { Link } from 'react-router';
import moment from 'moment';

import { Button } from '../../../components';
import {
	ICONS,
	TRADE_ACCOUNT_UPGRADE_MONTH,
	TRADING_VOLUME_CHART_LIMITS,
	BASE_CURRENCY,
	DEFAULT_COIN_DATA
} from '../../../config/constants';
import STRINGS from '../../../config/localizedStrings';

const SucessStatus = ({ isAccountDetails }) => (
	<div className="d-flex">
		{isAccountDetails && (
			<div className="requirement-verified mr-2">
				{STRINGS.USER_VERIFICATION.COMPLETED.toUpperCase()}
			</div>
		)}
		<ReactSvg
			path={ICONS.GREEN_CHECK}
			wrapperClassName="requirement-stauts"
		/>
	</div>
);

const IncompleteStatus = ({ isAccountDetails }) => (
	<div className="d-flex">
		{isAccountDetails ? (
			<div className="requirement-incomplete mr-2">
				{STRINGS.USER_VERIFICATION.INCOMPLETED.toUpperCase()}
			</div>
		) : (
			<ReactSvg
				path={ICONS.VERIFICATION_INCOMPLETE}
				wrapperClassName="requirement-stauts"
			/>
		)}
	</div>
);

const PendingStatus = ({ isAccountDetails }) => (
	<div className="d-flex">
		<ReactSvg
			path={ICONS.VERIFICATION_PENDING}
			wrapperClassName="requirement-stauts"
		/>
	</div>
);

const RejectedStatus = ({ isAccountDetails }) => (
	<div className="d-flex">
		<ReactSvg
			path={ICONS.VERIFICATION_REJECTED}
			wrapperClassName="requirement-stauts"
		/>
	</div>
);

const checkBankVerification = (bank_account = [], id_data) => {
	let bank_status = 0;
	if (bank_account.length) {
		if (bank_account.filter((data) => data.status === 3).length) {
			bank_status = 3;
		} else if (bank_account.filter((data) => data.status === 1).length) {
			bank_status = 1;
		} else if (bank_account.filter((data) => data.status === 2).length) {
			bank_status = 2;
		}
		if (id_data.status !== 3) {
			bank_status = 1;
		}
		if (
			bank_account.length ===
			bank_account.filter((data) => data.status === 0).length
		) {
			bank_status = 0;
		}
	}
	return bank_status;
};

const checkMonth = (currentDate, month) => {
	const diffMonth = moment().diff(moment(currentDate), 'months');
	return diffMonth >= month;
};

const getRequirements = (user, level, lastMonthVolume, coins) => {
	const { address, phone_number, id_data = {}, bank_account } = user.userData;
	const bank_verified = checkBankVerification(bank_account, id_data);
	const { symbol = '' } = coins[BASE_CURRENCY] || DEFAULT_COIN_DATA;
	const identity = address.country
		? id_data.status && id_data.status === 3
			? 3
			: 1
		: 1;
	const verificationObj = {
		level_1: {},
		level_2: {
			'1': {
				title: STRINGS.USER_VERIFICATION.TITLE_USER_DOCUMENTATION,
				completed: identity === 3 ? true : false,
				status: identity
			},
			'2': {
				title: STRINGS.USER_VERIFICATION.TITLE_ID_DOCUMENTS,
				completed: id_data.status === 3,
				status: id_data.status
			},
			'3': {
				title: STRINGS.USER_VERIFICATION.TITLE_MOBILE,
				completed: !!phone_number,
				status: phone_number ? 3 : 0
			},
			'4': {
				title: STRINGS.USER_VERIFICATION.CONNECT_BANK_ACCOUNT,
				completed: bank_verified === 3 ? true : false,
				status: bank_verified
			}
		},
		level_3: {
			'1': {
				title: STRINGS.formatString(
					STRINGS.SUMMARY.ACCOUNT_AGE_OF_MONTHS,
					TRADE_ACCOUNT_UPGRADE_MONTH[0]
				).join(' '),
				completed: checkMonth(
					user.created_at,
					TRADE_ACCOUNT_UPGRADE_MONTH[0]
				)
			},
			'2': {
				title: STRINGS.formatString(
					STRINGS.SUMMARY.TRADING_VOLUME_EQUIVALENT,
					TRADING_VOLUME_CHART_LIMITS[0],
					symbol.toUpperCase()
				).join(' '),
				completed: TRADING_VOLUME_CHART_LIMITS[0] <= lastMonthVolume
			}
		},
		level_4: {
			'1': {
				title: STRINGS.formatString(
					STRINGS.SUMMARY.ACCOUNT_AGE_OF_MONTHS,
					TRADE_ACCOUNT_UPGRADE_MONTH[1]
				).join(' '),
				completed: checkMonth(
					user.created_at,
					TRADE_ACCOUNT_UPGRADE_MONTH[1]
				)
			},
			'2': {
				title: STRINGS.formatString(
					STRINGS.SUMMARY.TRADING_VOLUME_EQUIVALENT,
					TRADING_VOLUME_CHART_LIMITS[1],
					symbol.toUpperCase()
				).join(' '),
				completed: TRADING_VOLUME_CHART_LIMITS[1] <= lastMonthVolume
			}
		}
	};
	return verificationObj[`level_${level}`];
};

const getStatusClass = (status_code, completed) => {
	switch (status_code) {
		case 0:
			return 'requirement-not-verified';
		case 1:
			return 'requirement-pending';
		case 2:
			return 'requirement-rejected';
		case 3:
			return 'requirement-verified';
		default:
			if (status_code === undefined && completed === false) {
				return 'requirement-not-verified';
			}
			return '';
	}
};

const getAllCompleted = (requirement) => {
	return (
		Object.keys(requirement).length ===
		Object.keys(requirement).filter((key) => requirement[key].completed)
			.length
	);
};

const getStatusIcon = (reqObj, isAccountDetails) => {
	if (isAccountDetails) {
		return reqObj.completed ? (
			<SucessStatus isAccountDetails={isAccountDetails} />
		) : (
			<IncompleteStatus isAccountDetails={isAccountDetails} />
		);
	} else {
		switch (reqObj.status) {
			case 0:
				return <IncompleteStatus isAccountDetails={isAccountDetails} />;
			case 1:
				return <PendingStatus isAccountDetails={isAccountDetails} />;
			case 2:
				return <RejectedStatus isAccountDetails={isAccountDetails} />;
			case 3:
				return <SucessStatus isAccountDetails={isAccountDetails} />;
			default:
				if (reqObj.status === undefined && reqObj.completed === false) {
					return <IncompleteStatus isAccountDetails={isAccountDetails} />;
				}
				return '';
		}
	}
};

const SummaryRequirements = ({
	coins,
	user,
	isAccountDetails = false,
	contentClassName = '',
	verificationLevel,
	lastMonthVolume,
	onUpgradeAccount
}) => {
	const {
		phone_number,
		address,
		id_data = {},
		bank_account = []
	} = user.userData;
	const selectedLevel = isAccountDetails
		? verificationLevel || user.verification_level
		: 2;
	const requirement = getRequirements(user, selectedLevel, lastMonthVolume, coins);
	let requirementResolved = getAllCompleted(requirement);
	return (
		<div className="d-flex">
			{!isAccountDetails && (
				<div>
					<ReactSvg
						path={ICONS.VERIFICATION_DOC_STATUS}
						wrapperClassName="requirement-doc-icon"
					/>
				</div>
			)}
			<div
				className={classnames(
					contentClassName,
					'requirements-content-text',
					'summary-content-txt'
				)}
			>
				<div className="my-2">
					{Object.keys(requirement).map((step, index) => {
						let reqObj = requirement[step];
						return (
							<div
								key={index}
								className={classnames(
									'd-flex',
									'justify-content-between',
									{
										[getStatusClass(
											reqObj.status,
											reqObj.completed
										)]: !isAccountDetails
									}
								)}
							>
								<div>{`${step}. ${reqObj.title}`}</div>
								<div>{getStatusIcon(reqObj, isAccountDetails)}</div>
							</div>
						);
					})}
				</div>
				{!isAccountDetails && !user.otp_enabled && (
					<div className="trade-account-link mb-2">
						<Link to="/security">
							{STRINGS.SUMMARY.ACTIVE_2FA_SECURITY.toUpperCase()}
						</Link>
					</div>
				)}
				{!isAccountDetails &&
				(!address.country ||
					id_data.status !== 3 ||
					!phone_number ||
					!bank_account.filter((acc) => acc.status === 3).length) ? (
					<div className="trade-account-link mb-2">
						<Link to="/verification">
							{STRINGS.USER_VERIFICATION.GOTO_VERIFICATION.toUpperCase()}
						</Link>
					</div>
				) : null}
				{isAccountDetails ? (
					<div className="mt-2">
						<Button
							label={STRINGS.SUMMARY.REQUEST_ACCOUNT_UPGRADE}
							disabled={!requirementResolved}
							onClick={onUpgradeAccount}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default SummaryRequirements;
