import JsxUtilsModule from "../../utils/JsxUtilsModule";

export default class extends JsxUtilsModule {
	*dependencies() {
		yield "common.Async";
	}

	import() {
		const uniqueWord = function() {
			return Math.floor(Math.random() * Math.pow(36, 4)).toString(36);
		};

		class MessagePacket {
			static fromRaw(message) {
				return new MessagePacket(message.id, message.type, message.data);
			}

			id;
			type;
			data;

			isReplied = false;
			isWaitingReply = false;

			constructor(id, type, data) {
				this.id = id;
				this.type = type;
				this.data = data;
			}

			delay(callback, duration = 0) {
				setTimeout(callback, duration);
			}

			promiseReply(callback) {
				this.isReplied = true;
				this.isWaitingReply = true;

				callback();
			}

			reply(response) {
				if(this.isReplied && !this.isWaitingReply) {
					console.warn('Attempting to send multiple responses', this);
					return;
				}

				this.isReplied = true;
				this.isWaitingReply = false;

				Envoy.send(Envoy.REPLY, {
					id: this.id,
					type: this.type,
					response: response
				}, 0)
			}

			toRaw() {
				return {
					$envoy: true,

					id: this.id,
					type: this.type,
					data: this.data,
				}
			}
		}

		// noinspection JSUnusedLocalSymbols
		/** @type $Envoy */
		global.Envoy = new class $Envoy {
			HANDSHAKE = 'HANDSHAKE';
			REQUEST   = 'REQUEST';
			REPLY  = 'REPLY';

			generateMessageId() {
				return `${uniqueWord()}${uniqueWord()}`;
			}

			get isFramed() {
				try {
					return window.self !== window.top;
				} catch (e) {
					return true;
				}
			}

			constructor() {
				this.receive = this.receive.bind(this);

				if(!window.Bluebird) {
					throw new Error("You need Bluebird library to use Envoy");
				}

				window.addEventListener('message', this.receive, false);
			}

			activeRequests = {};
			targetFrame = null;

			logForeignRequests = false;

			listeners = [];
			listen(type, listener) {
				if(!listener) {
					listener = type;
					type = null;
				}

				this.listeners.push({ type, listener });
			}
			unlisten(listener) {
				this.listeners = this.listeners.filter(d => d.listener === listener);
			}

			send(type = this.REQUEST, data, timeout = 0) {
				if(this.isFramed == false && this.targetFrame === null) {
					throw new Error("Envoy in not in frame and targetFrame is null");
				}

				return new Bluebird((resolve, reject, onCancel) => {
					let id = this.generateMessageId();
					let timeoutId = null;

					if(type != this.REPLY && timeout) {
						timeoutId = setTimeout(() => reject(`Envoy request timed out: ${id}`), timeout);

						onCancel(() => clearTimeout(timeoutId));
					}

					this.activeRequests[id] = { data, resolve, reject, timeoutId };

					let message = new MessagePacket(id, type, data);

					if(this.targetFrame !== null) {
						// noinspection JSUnresolvedFunction,JSUnresolvedVariable
						this.targetFrame.contentWindow.postMessage(message.toRaw(), '*');
					} else {
						// noinspection JSUnresolvedFunction
						window.top.postMessage(message.toRaw(), '*');
					}

					// this.log(false, message);
				});
			}

			receive(message) {
				if(!message.data || !message.data.$envoy) {
					if(this.logForeignRequests) {
						console.log('Received foreign message', message);
					}

					return;
				}

				message = MessagePacket.fromRaw(message.data);

				// this.log(true, message);

				if(message.type == this.REPLY) {
					return this.resolveRequest(message.data);
				}

				for(const item of this.listeners) {
					if(!item.type || item.type == message.type) {
						item.listener(message);
					}
				}

				if(message.isReplied == false) {
					// No response from listeners -- send empty reply to prevent timeout
					message.reply(undefined);
				}
			}

			resolveRequest(data) {
				// We received a response to already sent request
				let request = this.activeRequests[data.id];

				if(!request) {
					console.error('Unknown request:', data.id, data);
					return;
				}

				request.resolve(data.response);

				if(request.timeoutId) {
					clearTimeout(request.timeoutId);
				}

				delete this.activeRequests[data.id];
			}

			log(isIncoming, message) {
				if(this.isFramed) {
					console.warn(isIncoming ? 'TOPLVL >> IFRAME' : 'IFRAME >> TOPLVL', '[ENVOY]', message.type, message);
				}
			}

			async sendHandshake() {
				await this.send(this.HANDSHAKE, null, 1000);
			}

			async waitHandshake() {
				return new Bluebird(resolve => {
					this.listen(this.HANDSHAKE, () => resolve());
				});
			}
		};
	}
}