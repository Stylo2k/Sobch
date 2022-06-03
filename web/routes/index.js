import express from "express";
import {getLog} from "../../lib/config.js";
import { db } from "../server.js";

const router = express.Router(),
    Log = getLog("index");

router.get('/', (req, res) => {
    // TODO : send back the access token : {accessToken: req.user.stsTokenManager.accessToken}
    res.status(200).send("Request received");
    Log.info(`Request received`)
})


export default {
    router: router
}