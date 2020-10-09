'use strict';

const Homey = require('homey');
const Util = require('/lib/util.js');
const callbacks = [
  'out_on',
  'out_off'
];

class ShellyEmDevice extends Homey.Device {

  onInit() {
    if (!this.util) this.util = new Util({homey: this.homey});

    this.homey.flow.getDeviceTriggerCard('triggerMeterPowerReturned');
    this.homey.flow.getDeviceTriggerCard('triggerReactivePower');

    this.setAvailable();

    // ADD AND REMOVE CAPABILITIES
    // TODO: REMOVE AFTER 3.1.0
    if (this.hasCapability('meter_power_consumed')) {
      this.removeCapability('meter_power_consumed');
    }
    if (!this.hasCapability('meter_power')) {
      this.addCapability('meter_power');
    }

    // UPDATE INITIAL STATE
    setTimeout(() => {
      this.initialStateUpdate();
    }, this.getStoreValue('channel') * 2000);

    // LISTENERS FOR UPDATING CAPABILITIES
    this.registerCapabilityListener('onoff', async (value) => {
      const path = value ? '/relay/0?turn=on' : '/relay/0?turn=off';
      return await this.util.sendCommand(path, this.getSetting('address'), this.getSetting('username'), this.getSetting('password'));
    });

    this.registerCapabilityListener('button.callbackevents', async () => {
      return await this.util.addCallbackEvents('/settings/relay/0?', callbacks, 'shellyem', this.getData().id, this.getSetting('address'), this.getSetting('username'), this.getSetting('password'));
    });

    this.registerCapabilityListener('button.removecallbackevents', async () => {
      return await this.util.removeCallbackEvents('/settings/relay/0?', callbacks, this.getSetting('address'), this.getSetting('username'), this.getSetting('password'));
    });

  }

  async onAdded() {
    setTimeout(async () => {
      /*await this.util.addCallbackEvents('/settings/relay/0?', callbacks, 'shellyem', this.getData().id, this.getSetting('address'), this.getSetting('username'), this.getSetting('password'));*/
      return await this.homey.app.updateShellyCollection();
    }, this.getStoreValue('channel') * 2000);
  }

  async onDeleted() {
    try {
      if (this.getStoreValue('channel') === 0) {
        const iconpath = "/userdata/" + this.getData().id +".svg";
        await this.util.removeCallbackEvents('/settings/relay/0?', callbacks, this.getSetting('address'), this.getSetting('username'), this.getSetting('password'));
        await this.util.removeIcon(iconpath);
      }
      await this.homey.app.updateShellyCollection();
      return;
    } catch (error) {
      this.log(error);
    }
  }

  // HELPER FUNCTIONS
  async initialStateUpdate() {
    try {
      let result = await this.util.sendCommand('/status', this.getSetting('address'), this.getSetting('username'), this.getSetting('password'), 'polling');
      if (!this.getAvailable()) { this.setAvailable(); }

      let channel = this.getStoreValue('channel');
      let onoff = result.relays[0].ison;
      let measure_power = result.meters[channel].power;
      let measure_voltage = result.emeters[channel].voltage;
      let meter_power = result.emeters[channel].total / 1000;
      let reactive_power = result.emeters[channel].reactive;
      let meter_power_returned = result.emeters[channel].total_returned / 1000;

      // capability onoff
      if (onoff != this.getCapabilityValue('onoff')) {
        this.setCapabilityValue('onoff', onoff);
      }

      // capability measure_power
      if (measure_power != this.getCapabilityValue('measure_power')) {
        this.setCapabilityValue('measure_power', measure_power);
      }

      // capability meter_power
      if (meter_power != this.getCapabilityValue('meter_power')) {
        this.setCapabilityValue('meter_power', meter_power);
      }

      // capability measure_voltage
      if (measure_voltage != this.getCapabilityValue('measure_voltage')) {
        this.setCapabilityValue('measure_voltage', measure_voltage);
      }

      // capability reactive_power
      if (reactive_power != this.getCapabilityValue('reactive_power')) {
        this.setCapabilityValue('reactive_power', reactive_power);
      }

      // capability meter_power_returned
      if (meter_power_returned != this.getCapabilityValue('meter_power_returned')) {
        this.setCapabilityValue('meter_power_returned', meter_power_returned);
      }

    } catch (error) {
      this.setUnavailable(this.homey.__('device.unreachable') + error.message);
      this.log(error);
    }
  }

  async deviceCoapReport(capability, value) {
    try {
      if (!this.getAvailable()) { this.setAvailable(); }

      switch(capability) {
        case 'relay0':
          if (value != this.getCapabilityValue('onoff')) {
            this.setCapabilityValue('onoff', value);
          }
          break;
        case 'power0':
        case 'power1':
          if (value != this.getCapabilityValue('measure_power')) {
            this.setCapabilityValue('measure_power', value);
          }
          break;
        case 'energyCounter0':
        case 'energyCounter1':
          let meter_power = value / 1000;
          if (meter_power != this.getCapabilityValue('meter_power')) {
            this.setCapabilityValue('meter_power', meter_power);
          }
          break;
        case 'energyReturned0':
        case 'energyReturned1':
          let meter_power_returned = value / 1000;
          if (meter_power_returned != this.getCapabilityValue('meter_power_returned')) {
            this.setCapabilityValue('meter_power_returned', meter_power_returned);
            this.homey.flow.getDeviceTriggerCard('triggerMeterPowerReturned').trigger(this, {'energy': meter_power_returned}, {});
          }
          break;
        case 'powerFactor0':
        case 'powerFactor1':
          if (value != this.getCapabilityValue('meter_power_factor')) {
            this.setCapabilityValue('meter_power_factor', value);
            this.homey.flow.getDeviceTriggerCard('triggerMeterPowerFactor').trigger(this, {'pf': value}, {});
          }
          break;
        case 'voltage0':
        case 'voltage1':
          if (value != this.getCapabilityValue('measure_voltage')) {
            this.setCapabilityValue('measure_voltage', value);
          }
          break;
        default:
          this.log('Device does not support reported capability '+ capability +' with value '+ value);
      }
      return Promise.resolve(true);
    } catch(error) {
      this.log(error);
      return Promise.reject(error);
    }
  }

  getCallbacks() {
    return callbacks;
  }

}

module.exports = ShellyEmDevice;
