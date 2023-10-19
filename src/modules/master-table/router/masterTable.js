import { Router } from 'express';
import { httpHandler } from '@madhouselabs/http-helpers';
import  {isLoggedIn} from "../../auth/router/passport";
import uploader from "../../../helpers/fileUploader";
import path from "path";
import fs from "fs";
import masterTableService from "../services/masterTable";


const router = Router();


router.post("/add",
    isLoggedIn,
    httpHandler(async (req, res) => {

            const dashboardPermission = req.user.data.dashboardPermission;
            const organizationId = req.user.data.organizationId;
            const addedBy = req.user.data._id;
            const result = await masterTableService.createMasterTable(req.body, dashboardPermission, organizationId, addedBy);
            res.send(result);

    })
    )



//// upload tabel data
router.put("/uploadTableData",
    isLoggedIn,
    uploader.single("file"),
    httpHandler(async (req, res) => {
        const filePath = req.file.path;
        const tableCodeId = req.body.tableCodeId;
        
        // Check file format (XLSX or CSV)
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        if (fileExtension !== '.xlsx' && fileExtension !== '.csv') {
             // Remove the uploaded file
             fs.unlinkSync(filePath); // Synchronously delete the file
            return res.status(400).json({ error: 'File format not supported. Please upload an XLSX or CSV file.' });
        }

        // Check file size (not larger than 10MB)
        if (req.file.size > 10 * 1024 * 1024) {
             // Remove the uploaded file
             fs.unlinkSync(filePath); // Synchronously delete the file
            return res.status(400).json({ error: 'File size exceeds the 10MB limit.' });
        }

        const result = await masterTableService.uploadMasterTableData(filePath, tableCodeId);

        // Remove the uploaded file after processing
        fs.unlinkSync(filePath); // Synchronously delete the file

        res.send(result)
    })
    )


//////////// get all table by user role /////////
router.get("/listAllTables",
    isLoggedIn,
    httpHandler(async (req, res)=> {
        const dashboardPermission = req.user.data.dashboardPermission;
        const publishStatus = req.query.publishStatus;
        const organizationId = req.user.data.organizationId;

        const result = await masterTableService.getallTable(dashboardPermission, organizationId, publishStatus);
        res.send(result)
    })
    )



  //////////////// get single Table Data /////////
  router.get("/tableDetails/:id",
  isLoggedIn,
  httpHandler(async (req, res)=> {
    const mstId = req.params.id;
    const tableData = await masterTableService.getSinlgleTable(mstId);
    res.send(tableData)

  })
  )  



  //////// get single object/row of table/masterTableData array by id ////////////////
  router.get("/tableRowDetails/:id",
  isLoggedIn,
  httpHandler(async (req, res)=> {
    const rowId = req.params.id;
    const rowData = await masterTableService.getTableRowData(rowId)
    res.send(rowData)
  })
  )



  /////// modify object/row of table/masterTableData array by id ////////////////
  router.put("/modifyTable/:tableId",
  isLoggedIn,
  httpHandler(async (req, res)=> {
    const tableId = req.params.tableId;
    const updatedData = req.body.masterTableData; // Updated data from the request body
    const rowData = await masterTableService.editTableData(updatedData, tableId)
    res.send(rowData)
  })
  )



  /////////publish draft table by id /////////
  router.put("/publish/:id",
  isLoggedIn,
  httpHandler(async (req, res)=> {
    const mstId = req.params.id;
    const result = await masterTableService.publishTable(mstId)
    res.send(result)
  })
  )


//////// delete draft table by id //////////

router.delete("/deleteDraftTable/:id",
isLoggedIn,
httpHandler(async (req, res)=> {
  const mstId = req.params.id;
  const deletetable = await masterTableService.deleteDraft(mstId)
  res.send(deletetable)
})
)

  ////////// delete master table by id ////////
  router.delete("/deleteTable/:id",
  isLoggedIn,
  httpHandler(async (req, res)=> {
    const mstId = req.params.id;
    const deletetable = await masterTableService.deleteTable(mstId)
    res.send(deletetable)
  })
  )




export default router;