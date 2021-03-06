import {get, ref, set} from "firebase/database";
import express from "express";
import {getLog, isAdmin} from "../../../lib/config.js";
import {db} from "../../server.js";

const router = express.Router(),
    Log = getLog("alter");

router.put('/:deviceId', async (req, res) => {
    let device, deviceId, user, config;
    try {
        device = req.body.device;
        config = device.config;
        deviceId = req.params.deviceId.trim();
        user = req.user;
    } catch(error) {
        res.status(400).send({error: "Bad Request"});
        Log.error(error);
        return;
    }

    try {
        const deviceSnapshot = await get(ref(db, `devices/${deviceId}`));
        
        if(deviceSnapshot.exists()) {
            const requester = await get(ref(db, `users/${user.uid}`));
            if (requester.exists()) {
                const owns = requester.val().owns;
                if (owns.includes(deviceId)) {
                    const deviceVal = deviceSnapshot.val();

                    const min = config.min || deviceVal.config.min || 0;
                    const max = config.max || deviceVal.config.max || 30;
                    const room = config.room || deviceVal.config.room || "";
                    var active;
                    if (config.active !== undefined) {
                        active = config.active;
                    } else if (deviceVal.config.active !== undefined) {
                        active =  deviceVal.config.active;
                    } else {
                        active =  false;
                    }
                    
                    deviceVal.config = {
                        "min": min,
                        "max": max,
                        "room": room,
                        "active": active
                    }

                    await set(ref(db, `devices/${deviceId}`), deviceVal);
                    res.status(200).send({message: "Success device updated", device : deviceVal,accessToken: req.user.stsTokenManager.accessToken});
                    Log.info("Success device updated", {device : deviceVal, user : user.uid});
                } else {
                    res.status(401).send({error: true, message : "Unauthorized"});
                    Log.info("Unauthorized user does not own this device", {user : user.uid});
                }
            } else {
                res.status(401).send({error: true, message : "Unauthorized"});
                Log.info("Unauthorized user does not exist", {user : user.uid});
            }
        } else {
            res.status(401).send({error: true, message : "Unauthorized"});
            Log.info("Unauthorized user does not exist", {user : user.uid});
        }
    } catch(error) {
        res.status(500).send({message: "Internal server error", error: true});
        Log.info("Internal server error", {user: user.uid});
    }
})

router.delete('/:deviceId', async (req, res) => {
    let deviceId, user;
    try {
        deviceId = req.params.deviceId.trim();
        user = req.user;
    } catch(error) {
        res.status(400).send({error: true, message : "Bad Request"});
        Log.error(error);
        return;
    }
    try {
        const deviceSnapshot = await get(ref(db, `devices/${deviceId}`));

        if(deviceSnapshot.exists()) {
            const requester = await get(ref(db, `users/${user.uid}`));

            if(requester.exists()) {
                let owns = requester.val().owns || [];
                let owners = deviceSnapshot.val().owners || [];

                if (!isAdmin(user.uid)) {
                    if (!owners.includes(user.uid)) {
                        res.status(401).send({error: true, message : "Unauthorized"});
                        Log.info("Unauthorized user does not own this device, user is not linked", {user : user.uid});
                        return;
                    }

                    if (!owns.includes(deviceId)) {
                        res.status(401).send({error: true, message : "Unauthorized"});
                        Log.info("Unauthorized user does not own this device, device is not linked", {user : user.uid});
                        return;
                    }
                }
                
                owns = owns.filter(id => id !== deviceId);
                owners = owners.filter(id => id !== user.uid);


                await set(ref(db, `users/${user.uid}/owns`), owns);
                await set(ref(db, `devices/${deviceId}/owners`), owners);  

                res.status(200).send({message: "Success device deleted",accessToken: req.user.stsTokenManager.accessToken});
                Log.info("Success device deleted", {deviceId: deviceId, user : user.uid});
            } else {
                res.status(401).send({error: "Unauthorized"});
                Log.info("Unauthorized user does not own this device", {user : user.uid});
            }
        }else{
            res.status(401).send({error: "Unauthorized"});
            Log.info("Unauthorized user does not own this device", {user : user.uid});
        }
    } catch(error) {
        res.status(500).send({message: "Internal server error", error: error});
        Log.info("Internal server error", {user: user.uid});
    }
})

export default {
    router: router
}