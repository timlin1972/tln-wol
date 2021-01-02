const wakeOnLan = require('wake_on_lan');
const ping = require('ping');

const MODULE_NAME = 'wol-data';

const DEF_LOGGER = null;
const DEF_WOL = null;
const DEF_I18N = null;

const DEF_PING_INTERVAL = 5000;
const DEF_PING_INITIAL_INTERVAL = 0;

const DEF_CONFIGS = {
  logger: DEF_LOGGER,
  wol: DEF_WOL,
  i18n: DEF_I18N,
};

class Data {
  constructor(configs=DEF_CONFIGS) {
    this.logger = configs.logger || DEF_LOGGER;
    this.wol = configs.wol || DEF_WOL;
    this.i18n = configs.i18n || DEF_I18N;

    this.pingHostPtr = null;

    this.data = [
      {
        desc: 'LinDS',
        ip: '192.168.0.168',
        mac: '00-11-32-37-67-8a',
        sendCount: 0,
        pingResult: 'n/a',
        pingResultTs: 0,
      }
    ]

    this.log('info', 'Initialized');
  }

  pingHost(ip) {
    const cbPing = (isAlive) => {
      //  if user stopped pinging immediately, this.pingHostPtr will be null, ignore the result
      if (!this.pingHostPtr)  return;

      const msgHostI18n = this.i18n ? this.i18n.t('Host') : 'Host';

      const item = this.data.find(x => x.ip === ip);
      if (item) item.pingResultTs = Date.now() / 1000 | 0;

      if (isAlive) {
        const msgAliveI18n = this.i18n ? this.i18n.t('is alive') : 'is alive';
        this.log('info', `${msgHostI18n} ${ip} ${msgAliveI18n}`);
  
        if (item) item.pingResult = 'Alive';

        this.pingHostPtr = null;
      } else {
        const msgDeadI18n = this.i18n ? this.i18n.t('is dead') : 'is dead';
        this.log('info', `${msgHostI18n} ${ip} ${msgDeadI18n}`);

        if (item) item.pingResult = 'Dead';

        this.pingHostPtr = setTimeout(() => this.pingHost(ip), DEF_PING_INTERVAL);
      }
      // graphql.wolsUpdated();
    };

    ping.sys.probe(ip, cbPing);
  }

  sendWol = (data) => {
    return new Promise(resolve => {
      const idx = parseInt(data);

      const item = this.data[idx];

      if (!item) {
        this.log('warn', 'Item is not found');
        return resolve(null);
      }

      wakeOnLan.wake(item.mac);
      item.sendCount++;

      const msgSendI18n = this.i18n ? this.i18n.t('Send WOL to') : 'Send WOL to';
      this.log('info', `${msgSendI18n} ${item.desc} (${item.ip}, ${item.mac})`);

      if (!this.pingHostPtr) {
        this.pingHostPtr = setTimeout(() => this.pingHost(item.ip), DEF_PING_INITIAL_INTERVAL);
      }

      // graphql.wolsUpdated();

      resolve(null);
    });
  }

  show = () => {
    return new Promise((resolve) => {
      this.log('info', 'index\tdesc\tip\t\tmac\t\t\tsend count\tping result\tlast ping time');
      this.data.forEach((item, idx) => {
        this.log('info', `${idx}\t${item.desc}\t${item.ip}\t${item.mac}\t${item.sendCount}\t\t${item.pingResult}\t\t${item.pingResultTs}`);
      })
      resolve(null);
    });
  }

  log = (level=DEF_LEVEL, msg) => {
    const msgI18n = this.i18n ? this.i18n.t(msg) : msg;
    this.logger ? 
      this.logger.log(MODULE_NAME, level, msgI18n) :
      console.log(`${level}: [${MODULE_NAME}] ${msgI18n}`);
  }
}

module.exports = Data;
