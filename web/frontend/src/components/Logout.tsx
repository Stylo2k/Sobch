import {Alert, AlertProps, Variant} from './CustomAlert';
import {useEffect, useState} from 'react';
import { isLoggedIn } from '../lib/acc';
import {useNavigate} from 'react-router-dom';
import NavBar from './NavBar';

function Logout () {

    const navigate = useNavigate();
    /**
     * Custom alert props which looks cleaner than the regular alert
     */
        const [alertProps, setAlertProps] = useState<AlertProps>({
        heading: '',
        message: '',
        variant: Variant.nothing
    });
    
     useEffect(()=> {
        if (isLoggedIn() == false) {
             setAlertProps({ 
                 heading: 'Logged out!',
                 message: "Success, you have logged out",
                 variant: Variant.info
             });
             setTimeout(()=> {
                navigate("/");
              }, 2000);
        }
    }, []);


    return (
        <div>
            <NavBar/>
            <Alert {...alertProps} />
        </div>
    );
}



export default Logout;