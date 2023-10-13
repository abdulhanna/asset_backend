import { Router } from 'express';
import { httpHandler } from '@madhouselabs/http-helpers';
import  {isLoggedIn} from "../../auth/router/passport";
import masterTableService from "../services/masterTable";


const router = Router();


router.post("/add",
    isLoggedIn,
    httpHandler(async (req, res) => {

            const dashboardPermission = req.user.data.dashboardPermission;
            const organizationId = req.user.data.organizationId;
            const result = await masterTableService.createMasterTable(req.body, dashboardPermission, organizationId);
            res.send(result);

    })
    )


router.get("/all",
    isLoggedIn,
    httpHandler(async (req, res)=> {
        const userId = req.user.data._id;
        const result = await masterTableService.getallTable(userId);
        res.send(result)
    })
    )


export default router;