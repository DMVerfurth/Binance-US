// Import dependencies
const crypto = require('crypto');
const WebSocket = require('ws');
const axios = require('axios');

// Handle socket event subscriptions
class EventEmitter {

    constructor() { this.events = {} }

    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        for (const callback of this.events[event])
            callback(data);
    }

}

class Web {

    // Configuration information
    static apiURL = 'https://api.binance.us';

    constructor(apiKey, secretKey) {

        this.apiKey = apiKey;
        this.secretKey = secretKey;

    }

    // https://docs.binance.us/#get-server-time
    async getServerTime() {

        const response = await axios.get(`/api/v3/time`);
        return response.data; 

    }

    // https://docs.binance.us/#get-system-status
    async getSystemStatus() {

        const response = await this.makeSignedRequest('GET', `/sapi/v1/system/status`);
        return response.data;

    }

    // https://docs.binance.us/?python#get-exchange-information
    async getExchangeInformation(symbols) {

        const params = {};
        if (symbols) {
            if (typeof symbols === 'string') params.symbol = symbols; 
            else params.symbols = JSON.stringify(symbols);
        }

        const response = await axios.get(`${Web.apiURL}/api/v3/exchangeInfo`, { params });
        return response.data;

    }

    // https://docs.binance.us/#trade-data
    async getRecentTrades(symbol, limit = 500) {

        const params = { symbol, limit }; 
        const response = await axios.get(`${Web.apiURL}/api/v3/trades`, { params });
        return response.data;

    }

    // https://docs.binance.us/#get-historical-trades-market_data
    async getHistoricalTrades(symbol, limit = 500, fromId) {

        const params = { symbol, limit, fromId };
        const headers = { 'X-MBX-APIKEY': this.apiKey };
        const response = await axios.get(`${Web.apiURL}/api/v3/historicalTrades`, { params, headers });
        return response.data;

    }

    // https://docs.binance.us/#get-aggregate-trades
    async getAggregateTrades(symbol, limit = 500, fromId, startTime, endTime) {

        const params = { symbol, limit, fromId, startTime, endTime };
        const response = await axios.get(`${Web.apiURL}/api/v3/aggTrades`, { params });
        return response.data;

    }

    // https://docs.binance.us/#get-order-book-depth
    async getOrderBookDepth(symbol, limit = 100) {

        const params = { symbol, limit };
        const response = await axios.get(`${Web.apiURL}/api/v3/depth`, { params });
        return response.data;

    }

    // https://docs.binance.us/#get-candlestick-data
    async getCandleStickData(symbol, interval, limit = 500, startTime, endTime) {

        const params = { symbol, interval, limit, startTime, endTime };
        const response = await axios.get(`${Web.apiURL}/api/v3/klines`, { params });
        return response.data;

    }

    // https://docs.binance.us/#get-ticker-price
    async getLiveTickerPrice(symbols) {

        const params = {};
        if (symbols) {
            if (typeof symbols === 'string') params.symbol = symbols; 
            else params.symbols = JSON.stringify(symbols);
        }

        const response = await axios.get(`${Web.apiURL}/api/v3/ticker/price`, { params });
        return response.data;

    }

    // https://docs.binance.us/#get-average-price
    async getAveragePrice(symbol) {

        const params = { symbol };
        const response = await axios.get(`${Web.apiURL}/api/v3/avgPrice`, { params });
        return response.data;

    }

    // https://docs.binance.us/#get-best-order-book-price
    async getBestOrderBookPrice(symbols) {

        const params = {};
        if (symbols) {
            if (typeof symbols === 'string') params.symbol = symbols; 
            else params.symbols = JSON.stringify(symbols);
        }

        const response = await axios.get(`${Web.apiURL}/api/v3/ticker/bookTicker`, { params });
        return response.data;

    }

    // https://docs.binance.us/#get-24h-price-change-statistics
    async getPriceChangeStatistics(symbols) {

        const params = {};
        if (symbols) {
            if (typeof symbols === 'string') params.symbol = symbols; 
            else params.symbols = JSON.stringify(symbols);
        }

        const response = await axios.get(`${Web.apiURL}/api/v3/ticker/24hr`, { params });
        return response.data;

    }

    // https://docs.binance.us/#get-rolling-window-price-change-statistics
    async getRollingWindowPriceChangeStatistics(symbols, windowSize = '1d', type = 'FULL') {

        const params = { windowSize, type };
        if (symbols) {
            if (typeof symbols === 'string') params.symbol = symbols; 
            else params.symbols = JSON.stringify(symbols);
        }

        const response = await axios.get(`${Web.apiURL}/api/v3/ticker`, { params });
        return response.data;

    }

    // https://docs.binance.us/#get-user-account-information-user_data
    async getUserAccountInformation() {

        const response = await this.makeSignedRequest('GET', `/api/v3/account`);
        return response.data;

    }

    // https://docs.binance.us/#get-user-account-status
    async getUserAccountStatus() {

        const response = await this.makeSignedRequest('GET', `/sapi/v3/accountStatus`);
        return response.data;

    }

    // https://docs.binance.us/#get-user-api-trading-status
    async getUserAPITradingStatus() {

        const response = await this.makeSignedRequest('GET', `/sapi/v3/apiTradingStatus`);
        return response.data;

    }

    // https://docs.binance.us/#get-asset-distribution-history
    async getAssetDistributionHistory(limit = 20, asset, category, startTime, endTime) {

        const params = { limit, asset, category, startTime, endTime };
        const response = await this.makeSignedRequest('GET', `/sapi/v1/asset/assetDistributionHistory`, params);
        return response.data;

    }

    // https://docs.binance.us/#get-trade-fee
    async getTradeFee(symbol) {

        const params = { symbol };
        const response = await this.makeSignedRequest('GET', `/sapi/v1/asset/query/trading-fee`, params);
        return response.data;

    }

    // https://docs.binance.us/#get-past-30-days-trade-volume
    async getPastMonthTradeVolume() {

        const response = await this.makeSignedRequest('GET', `/sapi/v1/asset/query/trading-volume`);
        return response.data;

    }

    // https://docs.binance.us/#sub-account-data
    // https://docs.binance.us/#get-sub-account-transfer-history
    // https://docs.binance.us/#execute-sub-account-transfer
    // https://docs.binance.us/#get-sub-account-assets
    // https://docs.binance.us/#get-master-account-39-s-total-usd-value
    // https://docs.binance.us/#get-sub-account-status-list

    // https://docs.binance.us/#get-order-rate-limits-user_data
    async getOrderRateLimits() {

        const response = await this.makeSignedRequest('GET', `/api/v3/rateLimit/order`);
        return response.data;

    }

    // https://docs.binance.us/#create-new-order-trade
    async createOrder(symbol, side, price, quantity, quoteOrderQty, type = 'LIMIT', timeInForce = 'GTC', trailingDelta, icebergQty, newClientOrderId) {

        const params = { symbol, side, price, quantity, quoteOrderQty, type, timeInForce, trailingDelta, icebergQty, newClientOrderId };
        const response = await this.makeSignedRequest('POST', `/api/v3/order`, params);
        return response.data;

    }

    // https://docs.binance.us/#get-order-user_data
    async getOrderStatus(symbol, orderId, origClientOrderId) {

        const params = { symbol, orderId, origClientOrderId };
        const response = await this.makeSignedRequest('GET', `/api/v3/order`, params);
        return response.data;

    }

    // https://docs.binance.us/#get-all-open-orders-user_data
    async getOpenOrders(symbol) {

        const params = { symbol };
        const response = await this.makeSignedRequest('GET', `/api/v3/openOrders`, params);
        return response.data;

    }

    // https://docs.binance.us/#cancel-order-trade
    async cancelOrder(symbol, orderId, newClientOrderId, cancelRestrictions) {

        const params = { symbol, orderId, origClientOrderId, newClientOrderId, cancelRestrictions };
        const response = await this.makeSignedRequest('DELETE', `/api/v3/order`, params);
        return response.data;

    }

    // https://docs.binance.us/#cancel-open-orders-for-symbol-trade
    async cancelOpenOrders(symbol) {

        const params = { symbol };
        const response = await this.makeSignedRequest('DELETE', `/api/v3/openOrders`, params);
        return response.data;

    }

    // https://docs.binance.us/#get-trades
    async getTrades(symbol, limit = 500, orderId, fromId, startTime, endTime) {

        const params = { symbol, limit, orderId, fromId, startTime, endTime };
        const response = await this.makeSignedRequest('GET', `/api/v3/myTrades`, params);
        return response.data;

    }

    // https://docs.binance.us/#replace-order-trade
    async replaceOrder(cancelOrderId, cancelNewClientOrderId, symbol, side, price, quantity, quoteOrderQty, type = 'LIMIT', timeInForce = 'GTC', trailingDelta, icebergQty, newClientOrderId, cancelReplaceMode = 'STOP_ON_FAILURE') {

        const params = { cancelOrderId, cancelNewClientOrderId, symbol, side, price, quantity, quoteOrderQty, type, timeInForce, trailingDelta, icebergQty, newClientOrderId, cancelReplaceMode };
        const response = await this.makeSignedRequest('POST', `/api/v3/cancelReplace`, params);
        return response.data;

    }

    // https://docs.binance.us/#query-prevented-matches-user_data
    async getPreventedMatches(symbol, limit = 500, orderId, preventedMatchId, fromPreventedMatchId) {

        const params = { symbol, limit, orderId, preventedMatchId, fromPreventedMatchId };
        const response = await this.makeSignedRequest('GET', `/api/v3/myPreventedMatches`, params);
        return response.data;

    }

    // https://docs.binance.us/#all-orders-user_data
    async getAllOrders(symbol, limit = 500, orderId, startTime, endTime) {

        const params = { symbol, limit, orderId, startTime, endTime };
        const response = await this.makeSignedRequest('GET', `/api/v3/allOrders`, params);
        return response.data;

    }

    /*
    // https://docs.binance.us/#create-new-oco-order-trade
    // https://docs.binance.us/#get-oco-order-user_data
    // https://docs.binance.us/#get-all-oco-order-user_data
    // https://docs.binance.us/#get-open-oco-orders-user_data
    // https://docs.binance.us/#cancel-oco-order-trade

    // https://docs.binance.us/#request-for-quote
    // https://docs.binance.us/#place-otc-trade-order
    // https://docs.binance.us/#get-otc-trade-order
    // https://docs.binance.us/#get-all-otc-trade-orders
    // https://docs.binance.us/#get-all-ocbs-trade-orders

    // https://docs.binance.us/#get-asset-fees-amp-wallet-status
    // https://docs.binance.us/#withdraw-fiat-via-bitgo
    // https://docs.binance.us/#withdraw-crypto
    // https://docs.binance.us/#get-crypto-withdrawal-history
    // https://docs.binance.us/#get-fiat-withdrawal-history

    // https://docs.binance.us/#get-crypto-deposit-address
    // https://docs.binance.us/#get-crypto-deposit-history
    // https://docs.binance.us/#get-fiat-deposit-history
    // https://docs.binance.us/#get-sub-account-deposit-address
    // https://docs.binance.us/#get-sub-account-deposit-history

    // https://docs.binance.us/#convert-dust
    // https://docs.binance.us/#get-convert-dust-history
    // https://docs.binance.us/#get-assets-that-can-be-converted
    // https://docs.binance.us/#get-referral-reward-history

    // https://docs.binance.us/#get-staking-asset-information
    // https://docs.binance.us/#stake-asset
    // https://docs.binance.us/#unstake-asset
    // https://docs.binance.us/#get-staking-balance
    // https://docs.binance.us/#get-staking-history
    // https://docs.binance.us/#get-staking-rewards-history

    // https://docs.binance.us/#get-account-balance
    // https://docs.binance.us/#get-supported-asset-list

    // https://docs.binance.us/#get-supported-asset-list
    // https://docs.binance.us/#transfer-from-exchange-wallet
    // https://docs.binance.us/#transfer-from-custodian
    // https://docs.binance.us/#undo-transfer
    // https://docs.binance.us/#get-exchange-wallet-transfer
    // https://docs.binance.us/#get-custodian-transfer

    // https://docs.binance.us/#create-new-order-cust
    // https://docs.binance.us/#create-new-oco-order-cust
    // https://docs.binance.us/#get-all-open-orders-cust
    // https://docs.binance.us/#get-order-cust
    // https://docs.binance.us/#get-order-history-cust
    // https://docs.binance.us/#get-trade-history-cust
    // https://docs.binance.us/#cancel-order-cust
    // https://docs.binance.us/#cancel-open-orders-for-symbol-cust
    // https://docs.binance.us/#cancel-oco-order-cust

    // https://docs.binance.us/#get-settlement-settings
    // https://docs.binance.us/#get-settlement-history

    // https://docs.binance.us/#get-credit-line-account-information-c-l
    // https://docs.binance.us/#get-alert-history-c-l
    // https://docs.binance.us/#get-transfer-history-c-l
    // https://docs.binance.us/#execute-transfer-c-l
    // https://docs.binance.us/#get-rebate-history
    */

    // https://docs.binance.us/#signature-authentication
    async makeSignedRequest(method, path, params = {}) {

        params.timestamp = Date.now();
        params.recvWindow = 2000;

        const url = Web.apiURL + path;
        const signature = this.generateSignature(params);
        const headers = { 'X-MBX-APIKEY': this.apiKey };
        const response = await axios({
            method, 
            url, 
            headers, 
            params: { ...params, signature }
        });

        return response;

    }

    // https://docs.binance.us/#signature-authentication
    generateSignature(data) {

        Object.keys(data).forEach(key => data[key] === undefined && delete data[key])
        const query = new URLSearchParams(data);
        query.sort();
        const hmac = crypto.createHmac('sha256', this.secretKey).update(query.toString());
        return hmac.digest('hex');

    }

}

class Socket {

    // Configuration information
    static websocketURL = 'wss://ws-api.binance.us:443/ws-api/v3';

    constructor(apiKey, secretKey) {

        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.socket;
        this.events = new EventEmitter();

    }

    // https://docs.binance.us/#test-connectivity-websocket
    sendPing = () => this.sendMessage('ping', 'ping');

    // https://docs.binance.us/#check-server-time-websocket
    getServerTime = () => this.sendMessage('time', 'serverTime');

    // https://docs.binance.us/#exchange-information-websocket
    getExchangeInformation(symbols) {

        const params = {};
        if (symbols) {
            if (typeof symbols === 'string') params.symbol = symbols; 
            else params.symbols = JSON.stringify(symbols);
        }

        this.sendMessage('exchangeInfo', 'exchangeInformation', params);

    }

    // https://docs.binance.us/#recent-trades-websocket
    getRecentTrades(symbol, limit = 500) {

        const params = { symbol, limit };
        this.sendMessage('trades.recent', 'recentTrades', params);

    }

    // https://docs.binance.us/#historical-trades-websocket
    getHistoricalTrades(symbol, limit = 500, fromId) {

        const params = { symbol, limit, fromId }
        this.sendMessage('trades.historical', 'historicalTrades', params);

    }

    // https://docs.binance.us/#aggregate-trades-websocket
    getAggregateTrades(symbol, limit = 500, fromId, startTime, endTime) {

        const params = { symbol, limit, fromId, startTime, endTime };
        this.sendMessage('trades.aggregate', 'aggregateTrades', params);

    }

    // https://docs.binance.us/#order-book-websocket
    getOrderBookDepth(symbol, limit = 100) {

        const params = { symbol, limit };
        this.sendMessage('depth', 'orderBookDepth', params);

    } 

    // https://docs.binance.us/#klines-websocket
    getCandleStickData(symbol, interval, limit = 500, startTime, endTime) {

        const params = { symbol, interval, limit, startTime, endTime };
        this.sendMessage('klines', 'candleStickData', params);

    }

    // https://docs.binance.us/#symbol-price-ticker-websocket
    getLiveTickerPrice(symbols) {

        const params = {};
        if (symbols) {
            if (typeof symbols === 'string') params.symbol = symbols; 
            else params.symbols = JSON.stringify(symbols);
        }

        this.sendMessage('ticker.price', 'liveTickerPrice', params);

    }

    // https://docs.binance.us/#current-average-price-websocket
    getAveragePrice(symbol) {

        const params = { symbol };
        this.sendMessage('avgPrice', 'averagePrice', params);

    }

    // https://docs.binance.us/#symbol-order-book-ticker-websocket
    getBestOrderBookPrice(symbols) {

        const params = {};
        if (symbols) {
            if (typeof symbols === 'string') params.symbol = symbols; 
            else params.symbols = JSON.stringify(symbols);
        }

        this.sendMessage('ticker.book', 'orderBookTicker', params);

    }

    // https://docs.binance.us/#24hr-ticker-price-change-statistics-websocket
    getPriceChangeStatistics(symbols) {

        const params = {};
        if (symbols) {
            if (typeof symbols === 'string') params.symbol = symbols; 
            else params.symbols = JSON.stringify(symbols);
        }

        this.sendMessage('ticker.24hr', 'priceChangeStatistics', params);

    }

    // https://docs.binance.us/#rolling-window-price-change-statistics-websocket
    getRollingWindowPriceChangeStatistics(symbols, windowSize = '1d', type = 'FULL') {

        const params = { windowSize, type };
        if (symbols) {
            if (typeof symbols === 'string') params.symbol = symbols; 
            else params.symbols = JSON.stringify(symbols);
        }

        this.sendMessage('ticker', 'rollingWindowPriceChangeStatistice', params);

    }

    // https://docs.binance.us/#get-user-account-information-websocket
    getUserAccountInformation = () => this.sendMessageSigned('account.status', 'accountInformation');

    // https://docs.binance.us/#get-order-rate-limits-websocket
    getOrderRateLimits = () => this.sendMessageSigned('account.rateLimits.orders', 'orderRateLimits');

    // https://docs.binance.us/#place-new-order-websocket
    createOrder(symbol, side, price, quantity, quoteOrderQty, type = 'LIMIT', timeInForce = 'GTC', trailingDelta, icebergQty, newClientOrderId) {

        const params = { symbol, side, price, quantity, quoteOrderQty, type, timeInForce, trailingDelta, icebergQty, newClientOrderId };
        this.sendMessageSigned('order.place', 'createOrder', params);

    }

    // https://docs.binance.us/#query-order-websocket
    getOrderStatus(symbol, orderId, origClientOrderId) {

        const params = { symbol, orderId, origClientOrderId };
        this.sendMessageSigned('order.status', 'orderStatus', params);

    }

    // https://docs.binance.us/#current-open-orders-websocket
    getOpenOrders(symbol) {

        const params = { symbol };
        this.sendMessageSigned('openOrders.status', 'openOrders', params);

    }

    // https://docs.binance.us/#cancel-order-websocket
    cancelOrder(symbol, orderId, newClientOrderId, cancelRestrictions) {

        const params = { symbol, orderId, newClientOrderId, cancelRestrictions };
        this.sendMessageSigned('order.cancel', 'cancelOrder', params);

    }

    // https://docs.binance.us/#cancel-open-orders-websocket
    cancelOpenOrders(symbol) {

        const params = { symbol };
        this.sendMessageSigned('openOrders.cancelAll', 'cancelOpenOrders', params);

    }

    // https://docs.binance.us/#replace-order-websocket
    replaceOrder(cancelOrderId, cancelNewClientOrderId, symbol, side, price, quantity, quoteOrderQty, type = 'LIMIT', timeInForce = 'GTC', trailingDelta, icebergQty, newClientOrderId, cancelReplaceMode = 'STOP_ON_FAILURE') {

        const params = { cancelOrderId, cancelNewClientOrderId, symbol, side, price, quantity, quoteOrderQty, type, timeInForce, trailingDelta, icebergQty, newClientOrderId, cancelReplaceMode };
        this.sendMessageSigned('order.cancelReplace', 'orderReplace', params);

    }

    // https://docs.binance.us/#account-prevented-matches-websocket
    getPreventedMatches(symbol, limit = 500, orderId, preventedMatchId, fromPreventedMatchId) {

        const params = { symbol, limit, orderId, preventedMatchId, fromPreventedMatchId };
        this.sendMessageSigned('myPreventedMatches', 'preventedMatches', params);

    }

    // https://docs.binance.us/#account-order-history-websocket
    getAllOrders(symbol, limit = 500, orderId, startTime, endTime) {

        const params = { symbol, limit, orderId, startTime, endTime };
        this.sendMessageSigned('allOrders', 'allOrders', params);

    }

    // https://docs.binance.us/#create-new-oco-order-websocket
    // https://docs.binance.us/#get-oco-order-websocket
    // https://docs.binance.us/#get-open-oco-orders-websocket
    // https://docs.binance.us/#account-oco-history-websocket

    // https://docs.binance.us/#request-format
    sendMessage = (method, id = 0, params) => this.socket.send(JSON.stringify({ id, method, params }));
    sendMessageSigned = (method, id = 0, params) => {

        params.apiKey = this.apiKey;
        params.timestamp = Date.now();
        params.recvWindow = 2000;
        
        const signature = this.generateSignature(params);

        this.socket.send(JSON.stringify({
            id, method,
            params: { ...params, signature }
        }));

    }

    // https://docs.binance.us/#signature-authentication
    generateSignature(data) {

        Object.keys(data).forEach(key => data[key] === undefined && delete data[key])
        const query = new URLSearchParams(data);
        query.sort();
        const hmac = crypto.createHmac('sha256', this.secretKey).update(query.toString());
        return hmac.digest('hex');

    }    

    // https://docs.binance.us/#websocket-api
    async connect() {

        return new Promise((resolve, reject) => {

            this.socket = new WebSocket(Socket.websocketURL);

            this.socket.on('open', () => {

                this.sendPing();
                setInterval(this.sendPing, 1000 * 60 * 3);
                resolve();

            });

            this.socket.on('error', (e) => console.error('Socket Error:', e));
            this.socket.on('close', (e) => console.log('Socket Closed', e));
            this.socket.on('message', (data) => this.socketMessageHandler(JSON.parse(data)));

        });

    }

    socketMessageHandler = (data) => this.events.emit(data.id, data);

}

class Stream {

    // Configuration information
    static dataStreamURL = 'wss://stream.binance.us:9443/ws';
    static apiURL = 'https://api.binance.us';

    static parseNumbers = (data) => { for (const key in data) data[key] = +data[key] || data[key] }

    constructor (symbol, apiKey) {

        this.events = new EventEmitter();
        this.symbol = symbol.toLowerCase();
        this.apiKey = apiKey;
        this.listenKey;
        this.socket;

    }

    /*
        https://docs.binance.us/#aggregate-trade-stream
        https://docs.binance.us/#trade-data-stream
        https://docs.binance.us/#candlestick-data-stream                                
        https://docs.binance.us/#order-book-streams
        https://docs.binance.us/#ticker-order-book-stream
    */
    /*
        aggTrade
        trade                                                                       (real-time trades)
        kline_(1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M)
        bookTicker                                                                  (real-time best prices)
        depth(5, 10, 20)@(100ms, 1000ms)                                            (order book updates)
    */

    subscribe = (stream) => this.sendMessage('SUBSCRIBE', 1, [`${this.symbol}@${stream}`]);
    unsubscribe = (stream) => this.sendMessage('UNSUBSCRIBE', 2, [`${this.symbol}@${stream}`]);
    sendMessage = (method, id = 0, params) => this.socket.send(JSON.stringify({ id, method, params }));

    async connect() {

        return new Promise(async (resolve, reject) => {

            this.listenKey = await this.getListenKey(this.apiKey);
            this.socket = new WebSocket(`${Stream.dataStreamURL}/${this.listenKey}`);

            this.socket.on('open', resolve);
            this.socket.on('error', (e) => console.error('Socket Error:', e));
            this.socket.on('close', (e) => console.log('Socket Closed', e))
            this.socket.on('message', (data) => this.socketMessageHandler(JSON.parse(data)));

            setInterval(this.getListenKey, 1000 * 60 * 30, this.apiKey);

        });

    }

    async getListenKey(apiKey) {

        const request = await axios({
            method: 'POST',
            url: `${Stream.apiURL}/api/v3/userDataStream`,
            headers: { 'X-MBX-APIKEY': apiKey }
        });

        return request.data.listenKey;

    }

    socketMessageHandler(data) {

        if (data.e == 'executionReport') return this.orderUpdateHandler(data);
        if (data.e) return this.events.emit(data.e, data);
        if (data.u) return this.events.emit('bookTicker', data);
        if (data.lastUpdateId) return this.events.emit('depth', data);

    }

    /*
        REJECTED
        FILLED
        PARTIALLY_FILLED
        NEW
        EXPIRED
        CANCELED
    */

    orderUpdateHandler(data) {

        if (data.s != this.symbol.toUpperCase()) return;
        if (data.S == 'BUY') return this.events.emit('BID_' + data.X, data);
        if (data.S == 'SELL') return this.events.emit('ASK_' + data.X, data);

    }

}

module.exports.Web = Web;
module.exports.Socket = Socket;
module.exports.Stream = Stream;