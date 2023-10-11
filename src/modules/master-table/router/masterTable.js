import { Router } from 'express';
import { httpHandler } from '@madhouselabs/http-helpers';
import  {isLoggedIn} from "../../auth/router/passport";
import masterTableColumnService from "../services/masterTableColumn";

const router = Router();


router.post("/add",
    isLoggedIn,
    httpHandler(async (req, res) => {
        const userRole = req.user.data.role;
        const organizationId = req.user.data.organizationId;
        const result = await masterTableColumnService.createMasterTable(req.body, userRole, organizationId);
        res.send(result);
    })
    )


router.get("/all",
    isLoggedIn,
    httpHandler(async (req, res)=> {
        const userId = req.user.data._id;
        const result = await masterTableColumnService.getallTable(userId);
        res.send(result)
    })
    )


export default router;