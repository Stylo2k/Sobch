import {db, auth} from '../../server.js';
import {getLog} from "../../../lib/config.js";
import express from "express";
import { ref, set, get, push} from "firebase/database";

const router = express.Router(),
    Log = getLog("my-devices");


function alreadyOwned(res) {
    res.status(405).send({error: "Already Owned"});
    Log.info("Already Owned device request");
    return;
}

function unauthorized(res, req) {
    res.status(401).send({error: "Unauthorized", accessToken: req.user.stsTokenManager.accessToken});
    return;
}


router.post("/", async (req, res) => {
    var device, otp, user;
    try {
        device = req.body.device;
        otp = device.otp;
        user = req.user;
    } catch(error) {
        res.status(400).send({error: "Bad Request"});
        Log.error(error);
        return;
    }

    const deviceId = device.id.toString().trim();
    const snapshot = await get(ref(db, `devices/${deviceId}`));
    if (snapshot.exists()) {
        var deviceSnapshot = snapshot.val();
        // otp matches -> add device

        if (otp === deviceSnapshot.otp) {
            Log.info("OTP MATCHES!")
            // make sure device owners is an array
            if (deviceSnapshot.owners === undefined || !Array.isArray(deviceSnapshot.owners)) {
                deviceSnapshot.owners = [];
            }

            // device already owned
            var deviceLiked = deviceSnapshot.owners.includes(user.uid);
            if (!deviceLiked) {
                deviceSnapshot.owners.push(user.uid);
            }

            await set(ref(db, `devices/${deviceId}`), deviceSnapshot);
            var userSnapshot = (await get(ref(db, `users/${user.uid}`))).val();
            if (userSnapshot.owns === undefined || !Array.isArray(userSnapshot.owns)) {
                userSnapshot.owns = [];
            }

            var userLinked = userSnapshot.owns.includes(deviceId);
            if (!userLinked) {
                userSnapshot.owns.push(deviceId);
            }

            await set(ref(db, `users/${user.uid}`), userSnapshot);

            if (deviceLiked && userLinked) {
                return alreadyOwned(res);
            }

            res.status(200).send({message: "device added", device: deviceSnapshot, accessToken: req.user.stsTokenManager.accessToken});
        }
        // otp does not match -> unauthorized
        else {
            unauthorized(res, req);
            Log.info("Device otp does not match");    
            return;
        }
    } else {
        unauthorized(res, req);
        Log.info("Unauthorized request to add device");
        return;
    }
});

// router.get("/", (req, res) => {
//     // TODO : send back the access token : {accessToken: req.user.stsTokenManager.accessToken}
//     // TODO: only allow this if the user is the owner of the device
//     const user = req.user;

//     var habibi = get(ref(db, `devices`));
//     console.log(habibi);
//     res.status(200).send("Request received");
//     Log.info("Request received");
// });

router.get('/', (req, res) => {
    try{
    const user = req.user;
    } catch(error) {
        res.status(400).send({error: "Bad Request"});
        Log.error(error);
        return;
    }
    //using this 'user' variable for now.
    get(ref(db, `users/${user.uid}`)).then((snapshot) => {
            if (snapshot.exists())
            {
                res.status(200).send({message: "Devices", deviceID: snapshot.val().owns, accessToken: req.user.stsTokenManager.accessToken})
            }
      }).catch((error) => {
        console.error(error);
      });
        
  })

export default {
    router: router
}
