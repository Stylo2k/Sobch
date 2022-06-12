import * as server from '../web/server.js';
import assert from 'assert';
import { describe } from 'mocha';
import axios from 'axios';
import { ref, set, get} from "firebase/database";
import {db} from "../lib/firebase.js";
import {PORT, PASSWORD, ACC_PASSWORD, TEST_PASSWORD, getLog, getUser} from '../lib/config.js';



var accessToken;
var registerAcc;



describe('Server can start', () => {
    it('running init', (done) =>{
        server.init();
        done();
    });
});



describe('login endpoint', () => {
    it('invalid password responds with status 400', (done) => {
        axios.post(`http://localhost:${PORT}/api/login`, {
            email: "mo.alshakoush@gmail.com",
            password: PASSWORD
        }).then((res) => {
            assert.equal(res.status, 400);
            done();
        }).catch((err) => {
            if (err.response.status === 400 && err.response.data.error === true && err.response.data.message === "Invalid Credentials") {
                done();
            } else {
                done(err);
            }
        })
    });

/**
 * Test the logout endpoint
 */

    it('invalid email responds with status 400', (done) => {
        axios.post(`http://localhost:${PORT}/api/login`, {
            email: "mo@gmail.com",
            password: ACC_PASSWORD
        }).then((res) => {
            assert.equal(res.status, 400);
            done();
        }).catch((err) => {
            assert.equal(err.response.status, 400);
            assert.equal(err.response.data.error, true);
            assert.equal(err.response.data.message, "Invalid Credentials");
            done();
        })
    });

    it('valid credentials responds with status 200', (done) => {
        axios.post(`http://localhost:${PORT}/api/login`, {
            email: "mo.alshakoush@gmail.com",
            password: ACC_PASSWORD
        }).then((res) => {
            assert.equal(res.status, 200);
            assert.equal(res.data.error, false);
            assert.equal(res.data.message, "Logged in!");
            accessToken = res.data.accessToken; // set the accesstoken for later use
            done();
        }).catch((err) => {
            done(err);
        })
    });
});

describe('My devices endpoint', () => {
    it ('user can get his devices', (done) => {
        axios.get(`http://localhost:${PORT}/api/my-devices`, {
            headers: {
                Authorization: `${accessToken}`
            }
        }).then((res) => {
            assert.equal(res.status, 200);
            /**
             * make sure that the owners list of every device includes the user id
             */
            res.data.devices.forEach((device) => {
                assert(device.owners.includes('VfULdqBkeYXXtjP0xK6lVvYQTIW2'));
            });

            /**
             * assert that the user is also linked to the devices
             */
            get(ref(db, `users/VfULdqBkeYXXtjP0xK6lVvYQTIW2`))
            .then((snapshot) => {
                var user = snapshot.val();
                user.owns.forEach((device) => {
                    assert(res.data.devices.some((dev) => dev.id === device));
                });
                done();
            })
        }).catch((err) => {
            done(err);
        });
    });
})


describe('logout endpoint', () => {
    it('logout endpoint works', (done) => {
        axios.post(`http://localhost:${PORT}/api/logout`, {}, {
            headers: {
                Authorization: `${accessToken}`    
            }
        }).then((res) => {
           assert.equal(res.status, 200);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});

/**
 * Test the register endpoint
 */
 describe('register endpoint', () => {
    it('register endpoint works', (done) => {
        axios.post(`http://localhost:${PORT}/api/register`, {
           credentials:{
                email: "testendpoint@test.com",
                password: TEST_PASSWORD
           },
            address: "testendpoint"
        }).then((res) => {
            assert.equal(res.status, 200);
            assert.equal(res.data.message, "Success, please make sure to verify your email in order to login");
            registerAcc = res.data.accessToken;
            done();
        }
        ).catch((err) => {
            done(err);
        });
    });
});

/**
 * test delete request in register endpoint
 */ 
describe('delete account', () => {
   

    it('delete account works', (done) => {
        axios.delete(`http://localhost:${PORT}/api/register`,{}, {
            headers: {
                Authorization: `${registerAcc}`
            }
        }).then((res) => {
            assert.equal(res.status, 200);
            done();
        }).catch((err) => {
            done(err);
        });
    });
});

/**test for alter endpoint
describe('alter endpoint', () => {
    it('alter endpoint works', (done) => {
        axios.put(`http://localhost:${PORT}/api/alter`, {},{
            "0" : min,
            "20" : max,
            "test" : room,
            "active" : active,

        }).then((res) => {
            assert.equal(res.status, 200);
            done();
        }
        ).catch((err) => {
            done(err);
        });
    } );
}
);
**/





