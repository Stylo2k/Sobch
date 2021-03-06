console.log("Generating devices...");
import fs from 'fs';
import {db} from "../lib/firebase.js";
import {get, ref, set} from "firebase/database";
import {genRandomTemperature} from '../simulation/main.js';
import {getLog} from "../lib/config.js";

const Log = getLog("genDevices");


/**
 * IDs of the admins
 */
const ADMINS = [
    "VfULdqBkeYXXtjP0xK6lVvYQTIW2", // mohammad
    "1CUMvWFlucbIddCwslwEsY5qlQb2", // carmen
    "yDU8z6Mizch1g4PMQHvWseYD8yF3", // dhruv
    "a2szgwUYHnUMInbc6cdiwXHeUN73", // selim
    "9GJaxXLYP5SaQDurokIpX2Yu79v1", // fergal
], emails = {
    "VfULdqBkeYXXtjP0xK6lVvYQTIW2" : {
        email : "mo.alshakoush@gmail.com"
    }, // mohammad
    "1CUMvWFlucbIddCwslwEsY5qlQb2" : {
        email : "m.c.jica@student.rug.nl"
    }, // carmen
    "yDU8z6Mizch1g4PMQHvWseYD8yF3" : {
        email : "dgroxmusic@gmail.com"
    }, // dhruv
    "a2szgwUYHnUMInbc6cdiwXHeUN73" : {
        email : "s.el.sayed.aly@student.rug.nl"
    }, // selim
    "9GJaxXLYP5SaQDurokIpX2Yu79v1" : {
        email : "f.j.mccollam@student.rug.nl"
    }, // fergal
}

/**
 * ID for the device
 * */
let ID = 0;

/**
 * retrieve the last made id from disk to ensure uniqueness
 * */
try {
    const data = fs.readFileSync(`${process.cwd()}/scripts/lastId.id`, 'utf8');
    ID = parseInt(data);
} catch (err) {
    Log.error(err);
    console.log(err);
    process.exit(1);
}


/**
 * Generates an id
 * @returns {string} A unique ID
 */
function generateID() {
    ID++;
    return ID.toString();
}

/**
 * @returns {string} One time password
 */
 function generateOTP() {
    let length = 16;
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result.match(/.{1,4}/g).join("-");
}

/**
 * Array of possible rooms for devices
 */
const ROOMS = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Garage"];

/**
 * Array of possible models for devices
 */
const MODELS = ["Sobch DHT-11", "Sobch DHT-22", "Sobch DHT-33", "Sobch DHT-44", "Sobch DHT-55"];

/**
 * 
 * generates a device
 * 
 * @returns {Object} A device
 */
function generateDevice() {
    let device = {};
    device.id = generateID();
    device.currentTemp = genRandomTemperature(15, 25, 2);
    device.config = {};
    device.config.min = genRandomTemperature(10, 15, 2);
    device.config.max = genRandomTemperature(25, 30, 2);
    device.config.room = ROOMS[Math.floor(Math.random() * ROOMS.length)];
    device.config.active = true;
    device.config.wantsToBeNotified = ADMINS;
    device.owners = ADMINS;
    device.model = MODELS[Math.floor(Math.random() * MODELS.length)];
    device.otp = generateOTP();
    return device;
}

let devices = [];

/**
 * generate x devices and add them to the database
 * */
for (let i = 0; i < 10; i++) {
    let device = generateDevice();
    devices.push(device.id);
    let devToAdd = {};
    for (let key in device) {
        devToAdd[key] = device[key];
    }
    await set(ref(db, `devices/${device.id}`), devToAdd);
}

/**
 * link every device to every admin
 * */
for (let admin of ADMINS) {
    let snapshot = await get(ref(db, `users/${admin}`))
    if (!snapshot.exists()) {
        await set(ref(db, `users/${admin}`), {credentials : { email : emails[admin].email}, owns : []});
        snapshot = await get(ref(db, `users/${admin}`))
    }
    const user = snapshot.val();
    if (user.owns === undefined || !Array.isArray(user.owns)) {
        user.owns = [];
    }
    let owns = user.owns || [];
    for (let device of devices) {
        owns.push(device);
    }
    user.owns = owns;
    // user.owns = []; // uncomment this to remove all devices from the admins
    await set(ref(db, `users/${admin}`), user);
}

/**
 * save the last made id to disk
 * */
const idString = (ID++).toString();
fs.writeFile(`${process.cwd()}/scripts/lastId.id`, idString, err => {
    if (err) {
        Log.error(err);
        process.exit(1);
    }
    console.log("Devices generated ended up at :" + idString);
    process.exit(0);
});

