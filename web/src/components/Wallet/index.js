import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Accordion } from '../';
import { BASE_CURRENCY, DEFAULT_COIN_DATA } from '../../config/constants';
import {
	calculateBalancePrice,
	calculatePrice,
	calculatePricePercentage,
	donutFormatPercentage,
	formatToCurrency
} from '../../utils/currency';
import WalletSection from './Section';
import { DonutChart } from '../../components';
import STRINGS from '../../config/localizedStrings';

class Wallet extends Component {
	state = {
		sections: [],
		totalAssets: 0,
		chartData: []
	};

	componentDidMount() {
		const { user_id, symbol, price } = this.props;
		if (user_id && symbol && price) {
			this.calculateSections(this.props);
		}
	}

	componentWillReceiveProps(nextProps) {
		if (
			nextProps.user_id !== this.props.user_id ||
			nextProps.price !== this.props.price ||
			nextProps.orders.length !== this.props.orders.length ||
			nextProps.balance.timestamp !== this.props.balance.timestamp ||
			JSON.stringify(this.props.prices) !== JSON.stringify(nextProps.prices) ||
			nextProps.activeLanguage !== this.props.activeLanguage
		) {
			this.calculateSections(nextProps);
		}
	}

	generateSection = (symbol, price, balance, orders, coins) => {
		const { min, fullname, ...rest } = coins[symbol] || DEFAULT_COIN_DATA;
		return {
			accordionClassName: 'wallet_section-wrapper',
			title: fullname,
			titleClassName: 'wallet_section-title',
			titleInformation: (
				<div className="wallet_section-title-amount">
					{formatToCurrency(balance[`${symbol}_balance`], min)}
					<span className="mx-1">{rest.symbol.toUpperCase()}</span>
				</div>
			),
			content: (
				<WalletSection
					symbol={symbol}
					balance={balance}
					orders={orders}
					price={price}
					coins={coins}
				/>
			)
		};
	};

	calculateSections = ({ price, balance, orders, prices, coins }) => {
		const sections = [];
		const data = [];
		const baseCoin = coins[BASE_CURRENCY] || DEFAULT_COIN_DATA;

		// TODO calculate right price
		const totalAssets = calculateBalancePrice(balance, prices);
		Object.keys(coins).forEach((currency) => {
			const { symbol, min } = coins[currency] || DEFAULT_COIN_DATA;
			const currencyBalance = calculatePrice(balance[`${symbol}_balance`], prices[currency]);
			const balancePercent = calculatePricePercentage(currencyBalance, totalAssets);
			data.push({
				...coins[currency],
				balance: balancePercent,
				balanceFormat: formatToCurrency(currencyBalance, min),
				balancePercentage: donutFormatPercentage(balancePercent)
			});
			sections.push(this.generateSection(symbol, price, balance, orders, coins));
		});

		this.setState({ sections, chartData: data, totalAssets: formatToCurrency(totalAssets, baseCoin.min) });
	};

	goToWallet = () => browserHistory.push('/wallet');

	render() {
		const { sections, totalAssets, chartData } = this.state;
		const { isValidBase } = this.props;

		if (Object.keys(this.props.balance).length === 0) {
			return <div />;
		}
		const { symbol = '' } = this.props.coins[BASE_CURRENCY] || {};

		return (
			<div className="wallet-wrapper">
				<div className="donut-container pointer" onClick={this.goToWallet}>
					<DonutChart
						coins={this.props.coins}
						chartData={chartData} />
				</div>
				<Accordion sections={sections} />
				{BASE_CURRENCY && isValidBase ? (
					<div className="wallet_section-wrapper wallet_section-total_asset d-flex flex-column">
						<div className="wallet_section-title">
							{STRINGS.WALLET.TOTAL_ASSETS}
						</div>
						<div className="wallet_section-total_asset d-flex justify-content-end">
							{symbol.toUpperCase()}
							<span>{totalAssets}</span>
						</div>
					</div>
				) : null}
			</div>
		);
	}
}

const mapStateToProps = (state, ownProps) => ({
	balance: state.user.balance,
	prices: state.orderbook.prices,
	symbol: state.orderbook.symbol,
	price: state.orderbook.price,
	orders: state.order.activeOrders,
	user_id: state.user.id,
	activeLanguage: state.app.language,
	coins: state.app.coins,
	isValidBase: state.app.isValidBase
});

export default connect(mapStateToProps)(Wallet);
