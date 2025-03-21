'use strict';

const Homey = require('homey');
const Driver = require('../driver_cloud.js');
const Util = require('../../lib/util.js');

class Shellyi4DriverCloud extends Driver {

  onOAuth2Init() {
    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      name: 'Shelly Plus i4 Cloud',
      battery: false,
      gen: 'gen2',
      communication: 'cloud',
      hostname: ['shellyplusi4-', 'ShellyPlusI4-'],
      type: ['SNSN-0024X'],
      channels: 1
    }
  }

}

module.exports = Shellyi4DriverCloud;
