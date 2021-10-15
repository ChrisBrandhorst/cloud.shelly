'use strict';

const Homey = require('homey');
const Driver = require('../driver.js');
const Util = require('../../lib/util.js');

class Shellyi3Driver extends Driver {

  onInit() {
    if (!this.util) this.util = new Util({homey: this.homey});

    this.config = {
      name: 'Shelly i3',
      battery: false,
      hostname: 'shellyi3-'
    }
  }

}

module.exports = Shellyi3Driver;
