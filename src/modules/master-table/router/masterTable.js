import { Router } from 'express';
import { httpHandler } from '@madhouselabs/http-helpers';
import  {isLoggedIn} from "../../auth/router/passport";


const router = Router();

router.get("/all",
    isLoggedIn,
    httpHandler(async (req, res)=> {
       console.log('ok')
    })
    )

export default router();