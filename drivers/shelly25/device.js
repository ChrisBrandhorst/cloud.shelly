'use strict';

const Homey = require('homey');
const Device = require('../device.js');
const Util = require('/lib/util.js');

class Shelly25Device extends Device {

  onInit() {
    if (!this.util) this.util = new Util({homey: this.homey});

    this.callbacks = [
      'shortpush',
      'longpush'
    ];
    // TODO: REMOVE AFTER 3.1.0
    this.temp_callbacks = [
      'btn_on',
      'btn_off',
      'out_on',
      'out_off',
      'shortpush',
      'longpush'
    ];

    this.homey.flow.getDeviceTriggerCard('triggerInput1On');
    this.homey.flow.getDeviceTriggerCard('triggerInput1Off');
    this.homey.flow.getDeviceTriggerCard('triggerOverpowered');

    // TODO: REMOVE AFTER 3.1.0
    this.homey.flow.getDeviceTriggerCard('triggerInput');

    this.setAvailable();

    if (!this.getStoreValue('sdk') === 3) {
      // TODO: REMOVE AFTER 3.1.0
      if (this.hasCapability('meter_power_wmin')) {
        this.removeCapability('meter_power_wmin');
      }
      if (this.hasCapability('alarm_generic')) {
        this.removeCapability('alarm_generic');
      }
      if (!this.hasCapability('input_1')) {
        this.addCapability('input_1');
      }
      if (this.hasCapability('button.callbackevents')) {
        this.removeCapability('button.callbackevents');
      }
      if (this.hasCapability('button.removecallbackevents')) {
        this.removeCapability('button.removecallbackevents');
      }
      if (this.getStoreValue("channel") === 1) {
        if (this.hasCapability('measure_temperature')) {
          this.removeCapability('measure_temperature');
        }
      }
      this.setStoreValue("sdk", 3);
    }

    // INITIAL UPDATE AND POLLING
    this.bootSequence();

    // LISTENERS FOR UPDATING CAPABILITIES
    this.registerCapabilityListener('onoff', async (value) => {
      const path = value ? '/relay/'+ this.getStoreValue("channel") +'?turn=on' : '/relay/'+ this.getStoreValue("channel") +'?turn=off';
      return await this.util.sendCommand(path, this.getSetting('address'), this.getSetting('username'), this.getSetting('password'));
    });

  }

  // HELPER FUNCTIONS

  // TODO: REMOVE AFTER 3.1.0
  async removeCallbacks() {
    return await this.util.removeCallbackEvents('/settings/actions?index='+ this.getStoreValue("channel") +'&name=', this.temp_callbacks, this.getSetting('address'), this.getSetting('username'), this.getSetting('password'));
  }

}

module.exports = Shelly25Device;
