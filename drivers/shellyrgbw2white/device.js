'use strict';

const Homey = require('homey');
const util = require('/lib/util.js');

class ShellyRGBW2WhiteDevice extends Homey.Device {

  onInit() {
    var interval = this.getSetting('polling') || 5;
    this.pollDevice(interval);

    // LISTENERS FOR UPDATING CAPABILITIES
    this.registerCapabilityListener('onoff', (value, opts) => {
      this.log('changing onoff value to: ', value);
      if (value) {
        return util.sendCommand('/white/'+ this.getStoreValue('channel') +'?turn=on', this.getSetting('address'), this.getSetting('username'), this.getSetting('password'));
      } else {
        return util.sendCommand('/white/'+ this.getStoreValue('channel') +'?turn=off', this.getSetting('address'), this.getSetting('username'), this.getSetting('password'));
      }
    });

    this.registerCapabilityListener('dim', (value, opts) => {
      var dim = value * 100;
      this.log('changing dim for channel '+ this.getStoreValue('channel') + ' to '+ dim);
      return util.sendCommand('/white/'+ this.getStoreValue('channel') +'?brightness='+ dim +'', this.getSetting('address'), this.getSetting('username'), this.getSetting('password'));
    });

  }

  onDeleted() {
    clearInterval(this.pollingInterval);
  }

  // HELPER FUNCTIONS
  pollDevice(interval) {
    clearInterval(this.pollingInterval);
    clearInterval(this.pingInterval);

    this.pollingInterval = setInterval(() => {
      util.sendCommand('/status', this.getSetting('address'), this.getSetting('username'), this.getSetting('password'))
        .then(result => {
          let channel = this.getStoreValue('channel');
          let state = result.lights[channel].ison;
          let dim = result.lights[channel].brightness > 100 ? 1 : result.lights[channel].brightness / 100;
          let power = result.lights[channel].power;


          this.log('current dim value for channel '+ channel + ' is '+ result.lights[channel].brightness +' and is converted to '+ dim);

          // capability onoff
          if (state != this.getCapabilityValue('onoff')) {
            this.log('changing onoff because shelly state returned '+ state +' while homey device onoff state is '+ this.getCapabilityValue('onoff'));
            this.setCapabilityValue('onoff', state);
          }

          // capability dim
          if (dim != this.getCapabilityValue('dim')) {
            this.log('changing dim because shelly dim state returned '+ dim +' while homey device dim state is '+ this.getCapabilityValue('dim'));
            this.setCapabilityValue('dim', dim);
          }

          // capability measure_power channel 0
          if (power != this.getCapabilityValue('measure_power')) {
            this.setCapabilityValue('measure_power', power);
          }

        })
        .catch(error => {
          this.log(error);
          this.setUnavailable(Homey.__('Unreachable'));
          this.pingDevice();
        })
    }, 1000 * interval);
  }

  pingDevice() {
    clearInterval(this.pollingInterval);
    clearInterval(this.pingInterval);

    this.pingInterval = setInterval(() => {
      util.sendCommand('/status', this.getSetting('address'), this.getSetting('username'), this.getSetting('password'))
        .then(result => {
          this.setAvailable();
          var interval = this.getSetting('polling') || 5;
          this.pollDevice(interval);
        })
        .catch(error => {
          this.log('Device is not reachable, pinging every 63 seconds to see if it comes online again.');
        })
    }, 63000);
  }

}

module.exports = ShellyRGBW2WhiteDevice;
