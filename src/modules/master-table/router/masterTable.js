import { Router } from 'express';
import { httpHandler } from '@madhouselabs/http-helpers';
import  {isLoggedIn} from "../../auth/router/passport";
import uploader from "../../../helpers/fileUploader";
import path from "path";
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




//// upload tabel data
router.post("/uploadTableData",
    isLoggedIn,
    uploader.single("file"),
    httpHandler(async (req, res) => {
        const filePath = req.file.path;
        const tableCodeId = req.body.tableCodeId;
        const addedBy = req.user.data._id;
        // Check file format (XLSX or CSV)
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        if (fileExtension !== '.xlsx' && fileExtension !== '.csv') {
            return res.status(400).json({ error: 'File format not supported. Please upload an XLSX or CSV file.' });
        }

        // Check file size (not larger than 10MB)
        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({ error: 'File size exceeds the 10MB limit.' });
        }

        const result = await masterTableService.uploadMasterTableData(filePath, tableCodeId, addedBy);
        res.send(result)
    })
    )


//////////// get all table by user role /////////
router.get("/all",
    isLoggedIn,
    httpHandler(async (req, res)=> {
        const dashboardPermission = req.user.data.dashboardPermission;
        const organizationId = req.user.data.organizationId;

        const result = await masterTableService.getallTable(dashboardPermission, organizationId);
        res.send(result)
    })
    )


export default router;