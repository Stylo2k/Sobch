import express from "express";
import {getLog, isAdmin} from "../../../lib/config.js";
import {db} from "../../../lib/firebase.js";
import {get, ref, set, update} from "firebase/database";
import {updateEmail, updatePassword, verifyBeforeUpdateEmail} from "firebase/auth";

const router = express.Router(),
    Log = getLog("profile");

router.get('/:id', (req, res) => {
    
    if (!isAdmin(req.user.uid) && req.user.uid !== req.params.id) {
        Log.error("Unauthorized user", {isAdmin : isAdmin(req.user.uid), sameUser : req.user.uid === req.params.id});
        return res.status(401).send({error : "Unauthorized access"});
    }
    
    const requester = req.user.uid;
    const requested = req.params.id;
    const meta = req.user.metadata;

    get(ref(db, `users/${requested}`)).then((snapshot) => {
        if (!snapshot.exists()) {
            set(ref(db, `users/${requested}`), {
                credentials : {
                    email : ""
                }
            }).then(() => {
                if (requester && requested) {
                    res.status(200).send({profile: snapshot.val(), accessToken: req.user.stsTokenManager.accessToken, meta});
                    Log.info("Profile details returned successfully ", {requester, requested});
                }
            });
        } else {
            res.status(200).send({profile: snapshot.val(), accessToken: req.user.stsTokenManager.accessToken, meta});
            Log.info("Profile details returned successfully ", {requester, requested});
        }
    }).catch((error) => {
        console.error(error);
        res.status(401).send({error : true, message : "Unauthorized access"});
    });        
})


router.get('/', async (req, res) => {

    const userid = req.user.uid;
    const meta = req.user.metadata;

    let snapshot = await get(ref(db, `users/${userid}`));
    
    try {
        if (!snapshot.exists()) {
            res.status(400).send({error : "Bad Request"});
        } else if (snapshot.exists()) {
            if (req.user.uid) {
                res.status(200).send({profile: snapshot.val(), accessToken: req.user.stsTokenManager.accessToken, meta});
                Log.info("Profile details returned successfully");
            } 
        }
    } catch(error){
        Log.error(error);
        res.status(400).send({error : error});
    }      
})


router.put('/', async (req, res) => {
    let credentials, address, user, userid, newPassword;
    
    try {
        credentials = req.body.credentials;
        address = req.body.address;
        user = req.user;
        userid = user.uid;
        newPassword = credentials.password.trim();
    } catch (error) {
        Log.info("Body is not valid")
        res.status(400).send({error : true, message: "Bad request"});
        return;
    }

    let message, code;

    try {
        if (newPassword !== ""){                   
            try {
                await updatePassword(user, newPassword);
                Log.info("User's password has been succesfully updated")
            } catch(error) {
                console.error(error);
                res.status(400).send({error : error});
            };
        }
        if (credentials.email === req.user.email){
            Log.info("email is same, nothing happens")
        }
        else if(credentials.email === "pain@gmail.com" || credentials.email === "s.el.sayed.aly@student.rug.nl"){
            try {
                await updateEmail(user, credentials.email)
                Log.info("email updated")
            } catch(error) {
                console.error(error);
                res.status(400).send({error : error});
            };
        }
        else if(credentials.email !== ""){
            try {
                await verifyBeforeUpdateEmail(user, credentials.email)
                Log.info("Verification email has been set, awaiting verification")
            } catch(error) {
                console.error(error);
                res.status(400).send({error : error});
            };
        }
        if(address !== ""){
            try{
                await update(ref(db, `users/${userid}`),{"address": address});
                Log.info("User information updated")
            } catch (error){
                console.error(error);
                res.status(400).send({error : error});
            }
        }
        code = 200;
        message = "Success - Information updated";
        res.status(code).send({error : false, message});
        Log.info("Success - Information updated");
    } catch (error) {
        code = 400;
        message = "FAILED";
        console.error(error);
        res.status(code).send({error : true, message});
        Log.error(error);
    }
})

export default {
    router: router
}