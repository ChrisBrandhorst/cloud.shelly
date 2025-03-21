'use strict';

const Homey = require('homey');
const Driver = require('../driver_cloud.js');
const Util = require('../../lib/util.js');

class ShellyVintageCloudDriver extends Driver {

  onOAuth2Init() {
    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      name: 'Shelly Vintage Cloud',
      battery: false,
      gen: 'gen1',
      communication: 'cloud',
      hostname: ['ShellyVintage-'],
      type: ['SHVIN-1'],
      channels: 1
    }
  }

}

module.exports = ShellyVintageCloudDriver;
