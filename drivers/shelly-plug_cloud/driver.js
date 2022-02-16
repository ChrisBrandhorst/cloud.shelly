'use strict';

const Homey = require('homey');
const Driver = require('../driver_cloud.js');
const Util = require('../../lib/util.js');

class ShellyPlugCloudDriver extends Driver {

  onOAuth2Init() {
    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      name: 'Shelly Plug Cloud',
      battery: false,
      hostname: ['shellyplug-'],
      code: ['SHPLG-1', 'SHPLG2-1', 'SHPLG-U1']
    }
  }

}

module.exports = ShellyPlugCloudDriver;
