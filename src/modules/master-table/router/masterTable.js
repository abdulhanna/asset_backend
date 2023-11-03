import { Router } from 'express';
import { httpHandler } from '@madhouselabs/http-helpers';
import  {isLoggedIn} from "../../auth/router/passport";
import uploader from "../../../helpers/fileUploader";
import path from "path";
import fs from "fs";
import masterTableService from "../services/masterTable";


const router = Router();

/////// add table columns and other details////////
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

/////////generate SmapelFile by Table id //////////

router.get("/generateSampleFile/:id",
isLoggedIn,
httpHandler(async (req, res)=> {
  const mstId = req.params.id;
  const tableFile = await masterTableService.generateSampelefile(mstId);
  res.send(tableFile)

})
)

//// upload tabel data
router.put("/uploadTableData",
    isLoggedIn,
    uploader.single("file"),
    httpHandler(async (req, res) => {
        const filePath = req.file.path;
        const originalname = req.file.originalname;
        const tableCodeId = req.body.tableCodeId;
        const publishStatus = req.body.publishStatus;
        const ubdatedBy = req.user.data._id;
        
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

        const result = await masterTableService.uploadMasterTableData(filePath, originalname, tableCodeId, ubdatedBy, publishStatus);
        // Remove the uploaded file after processing
        fs.unlinkSync(filePath); // Synchronously delete the file
        if(result.statusCode)
        {
          res.status(417).json({msg: 'something unwanted occured....', error: result.msg,'errorFile': result.errorFile, 'uploadedFile': result.uploadedFile});
        }
      
          res.send(result)
    })
    )


//////////// get all table by user role /////////
router.get("/listAllTables",
    isLoggedIn,
    httpHandler(async (req, res)=> {

      const currentPage = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.size) || 10;
      const sortBy = req.query.sort ? JSON.parse(req.query.sort) : 'createdAt';

        const dashboardPermission = req.user.data.dashboardPermission;
        const publishStatus = req.query.publishStatus;
        const organizationId = req.user.data.organizationId;

        const result = await masterTableService.getallTable(dashboardPermission, organizationId, publishStatus, currentPage, limit, sortBy);
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

  //////////////// get single row data by row and table id
  router.get("/table/:tableId/rowDetails/:rowId",
  isLoggedIn,
  httpHandler(async (req, res)=> {
    const tableId = req.params.tableId;
    const rowId = req.params.rowId;
    const rowData = await masterTableService.getSingleRow(tableId, rowId)
    res.send(rowData)
  })
  )

  /////// modify obeject/row of  masterTableData array and create a new document ////////////////
  router.put("/modifyTable/:tableId",
  isLoggedIn,
  httpHandler(async (req, res)=> {
    const tableId = req.params.tableId;
    const organizationId = req.user.data.organizationId;
    const ubdatedBy = req.user.data._id;

    const rowData = await masterTableService.modifyTableData(req.body, tableId, organizationId, ubdatedBy)
    res.send(rowData)
  })
  )


  //////////////// edit the drafts table ////////////

  router.put("/editTable/:tableId",
  isLoggedIn,
  httpHandler(async (req, res)=> {
    const tableId = req.params.tableId;
    const ubdatedBy = req.user.data._id;

    const rowData = await masterTableService.editTableData(req.body, tableId, ubdatedBy)
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

router.delete("/discardDraftTable/:id",
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