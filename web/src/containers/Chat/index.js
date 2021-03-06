import React, { Component } from 'react';
import io from 'socket.io-client';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isMobile } from 'react-device-detect';
import { ChatWrapper } from '../../components';
import { WS_URL } from '../../config/constants';
import {
	setAnnouncements,
	setChatUnreadMessages,
	USER_TYPES,
	MESSAGE_TYPES
} from '../../actions/appActions';
import { getToken, isLoggedIn } from '../../utils/token';

const ENTER_KEY = 'Enter';

class Chat extends Component {
	state = {
		chatWs: null,
		chatSocketInitialized: false,
		chatSocketInitializing: false,
		to: '',
		messages: []
	};

	componentWillMount() {
		if (!this.props.fetchingAuth && isLoggedIn()) {
			this.initializeChatWs(getToken());
		}
	}

	componentWillReceiveProps(nextProps) {
		if (
			!nextProps.fetchingAuth &&
			nextProps.fetchingAuth !== this.props.fetchingAuth
		) {
			if (!this.state.chatWs && isLoggedIn()) {
				this.initializeChatWs(getToken());
			}
		}
		if (nextProps.username_set) {
			this.state.chatWs.emit('changeUsername');
		}
	}

	componentWillUnmount() {
		this.closeChatSocket();
	}

	initializeChatWs = (token = '') => {
		this.isInitializing(true);
		const chatWs = io.connect(`${WS_URL}/chat`, {
			query: {
				token: token ? `Bearer ${token}` : ''
			}
		});

		this.setState({ chatWs });

		chatWs.on('init', ({ messages = [], announcements = [] }) => {
			this.setState({
				chatSocketInitializing: false,
				messages: messages
			});
			setTimeout(() => {
				this.setState({
					chatSocketInitialized: true
				});
			}, 1000);
			this.props.setAnnouncements(announcements);
		});

		chatWs.on('error', (error) => {
			this.isInitializing(false);
		});

		chatWs.on('message', (message) => {
			let newMessage = { ...message };
			if (typeof message.username === 'object') {
				newMessage = { ...message, ...message.username };
			}
			const messages = this.state.messages.concat(newMessage);
			const unreadMessages = this.props.minimized
				? this.props.unreadMessages +
				  (messages.length - this.state.messages.length)
				: 0;
			this.props.setChatUnreadMessages(unreadMessages);
			this.setState({ messages });
		});

		chatWs.on('announcement', (announcement) => {
			this.props.setAnnouncements(announcement);
		});

		chatWs.on('deleteMessage', (idToDelete) => {
			const indexOfMessage = this.state.messages.findIndex(
				({ id }) => id === idToDelete
			);
			if (indexOfMessage > -1) {
				const messages = [].concat(this.state.messages);
				messages.splice(indexOfMessage, 1);
				this.setState({ messages });
			}
		});
	};

	closeChatSocket = () => {
		if (this.state.chatWs) {
			this.state.chatWs.close();
		}
	};

	setChatBoxRef = (ref) => {
		if (ref && ref.el) {
			this.chatMessageBox = ref.el;
		}
	};

	sendMessage = (e) => {
		if (e.key === ENTER_KEY) {
			e.preventDefault();
			const message = this.chatMessageBox.value;
			if (message.trim().length > 0) {
				const { username } = this.props;
				const { to } = this.state;
				const chatMessage = {
					username,
					userType: USER_TYPES.USER_TYPE_NORMAL,
					to,
					message,
					type: MESSAGE_TYPES.MESSAGE_TYPE_NORMAL
				};

				this.state.chatWs.emit('message', chatMessage);

				this.chatMessageBox.value = '';
				this.chatMessageBox.style.height = isMobile ? '32px' : '36px';
			}
		}
	};

	isInitializing = (condition) => {
		this.setState({ chatSocketInitializing: condition });
	};

	resetUnreadMessages = () => {
		this.setState({ unreadMessages: 0 });
	};

	removeMessage = (id) => {
		this.state.chatWs.emit('deleteMessage', id);
	};

	render() {
		const {
			username,
			userType,
			userInitialized,
			onMinimize,
			minimized,
			chatIsClosed,
			set_username
		} = this.props;
		const {
			messages,
			chatSocketInitialized,
			chatSocketInitializing,
			unreadMessages
		} = this.state;

		return (
			<ChatWrapper
				chatSocketInitializing={chatSocketInitializing}
				chatSocketInitialized={chatSocketInitialized}
				title="Chat"
				username={username}
				userType={userType}
				messages={messages}
				unreadMessages={unreadMessages}
				setChatBoxRef={this.setChatBoxRef}
				sendMessage={this.sendMessage}
				userInitialized={userInitialized}
				minimized={minimized || !userInitialized || !chatSocketInitialized}
				minimizeChat={onMinimize}
				chatIsClosed={chatIsClosed}
				set_username={set_username}
				removeMessage={this.removeMessage}
			/>
		);
	}
}

const mapStateToProps = (store) => ({
	fetchingAuth: store.auth.fetching,
	username: store.user.username,
	username_set: store.user.username_set,
	userType: store.auth.userType,
	userInitialized: store.user.fetched,
	unreadMessages: store.app.chatUnreadMessages,
	set_username: store.user.settings.chat.set_username
});

const mapDispatchToProps = (dispatch) => ({
	setAnnouncements: bindActionCreators(setAnnouncements, dispatch),
	setChatUnreadMessages: bindActionCreators(setChatUnreadMessages, dispatch),
	dispatch
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Chat);
