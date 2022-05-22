import {db} from '../../server.js';
import config from "../../../lib/config.js";
import express from "express";
import { ref, set } from "firebase/database";

const router = express.Router(),
    Log = config.getLog("my-devices");


router.post("/", (req, res) => {
    const device = req.body.device;
    var user = req.user;
    set(ref(db, `devices/${device.id}`),
    {
        "id": device.id,
        "owner": user.id,
        "config": {
        "min": device.config.min,
        "max": device.config.max,
        "room": device.config.room,
        "active": device.config.active
        },
        "otp": req.body.otp,
        
    
    });
    console.log(user.id);
    res.status(200).send(req.body);
    Log.info("Device added", device);
});

router.get("/", (req, res) => {
    res.status(200).send("Request received");
    Log.info("Request received");
});

export default {
    router: router
}
