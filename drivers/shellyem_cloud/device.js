'use strict';

const Homey = require('homey');
const Device = require('../device_cloud.js');
const Util = require('../../lib/util.js');

class ShellyEmCloudDevice extends Device {

  onOAuth2Init() {
    if (!this.util) this.util = new Util({homey: this.homey});

    this.callbacks = [];

    this.homey.flow.getDeviceTriggerCard('triggerMeterPowerReturned');

    this.bootSequence();

    // CAPABILITY LISTENERS
    this.registerCapabilityListener("onoff", this.onCapabilityOnoff.bind(this));

  }

  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.setEnergy({ cumulative: newSettings.cumulative });
  }

}

module.exports = ShellyEmCloudDevice;
