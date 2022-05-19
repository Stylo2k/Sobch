import express from "express";
import config from "../../../lib/config.js";
import { db } from "../../server.js";

const router = express.Router(),
    Log = config.getLog("profile");

router.get('/', (req, res) => {
    res.status(200).send("Request received");
    Log.info(`Request received`)
})

router.put('/', (req, res) => {
    res.status(200).send("Request received");
    Log.info(`Request received`)
})

export default {
    router: router
}