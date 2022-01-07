'use strict';

const Homey = require('homey');
const Driver = require('../driver_cloud.js');
const Util = require('../../lib/util.js');

class ShellyEmCloudDriver extends Driver {

  onInit() {
    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      name: 'Shelly EM Cloud',
      battery: false,
      hostname: ['shellyem-']
    }
  }

}

module.exports = ShellyEmCloudDriver;
