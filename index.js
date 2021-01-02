// const Graphql = require('./graphql');
const Data = require('./data');

const MODULE_NAME = 'wol';

const DEF_LOGGER = null;
const DEF_I18N = null;

const DEF_CONFIGS = {
  logger: DEF_LOGGER,
  i18n: DEF_I18N,
}

class Wol {
  constructor(configs=DEF_CONFIGS) {
    this.logger = configs.logger || DEF_LOGGER;
    this.i18n = configs.i18n || DEF_I18N;

    // this.graphql = new Graphql({
    //   logger: this.logger,
    //   iam: this,
    //   i18n: this.i18n,
    // });

    this.data = new Data({
      logger: this.logger,
      wol: this,
      i18n: this.i18n,
    });

    this.log('info', 'Initialized');
  }

  // getSchema = () => this.graphql.getSchema();

  show = () => this.data.show();

  sendWol = (data) => this.data.sendWol(data);

  log = (level=DEF_LEVEL, msg) => {
    const msgI18n = this.i18n ? this.i18n.t(msg) : msg;
    this.logger ? 
      this.logger.log(MODULE_NAME, level, msgI18n) :
      console.log(`${level}: [${MODULE_NAME}] ${msgI18n}`);
  }

  toString = () => `[${MODULE_NAME}]\n\
    \tlogger: ${this.logger ? 'yes' : 'no'}\n\
    \ti18n: ${this.i18n ? 'yes' : 'no'}\n\
    `;
}

module.exports = Wol;
