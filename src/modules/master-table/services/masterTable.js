import StatusCodes from "http-status-codes";
import createError from "http-errors-lite";
import {assert, assertEvery} from "../../../helpers/mad-assert";
import { masterTableModel } from '../models';
import autoCodeGeneration from "../../../helpers/autoGeneratedCode";
import globalDetails from "../../../helpers/globalDetails";
import ExcelJS from "exceljs";
import fs from "fs";
import mongoose from "mongoose";
import {secret} from "../../../config/secret";


const masterTableService = {}

///////// adding table column and generating sheet ///////////
masterTableService.createMasterTable = async (data, dashboardPermission, organizationId, addedByUserId) => {

     const organizationName = await globalDetails.getOrganizationName(
         organizationId
     );

     const finalMSTCodeId = data.codeGenerationType === 'manual' ? data.tableCodeId : await autoCodeGeneration.getmstCode(organizationName);

     const finalOrganizationId = dashboardPermission === 'root_dashboard' ? null : organizationId;


        const getExistingtable = await masterTableModel.findOne({
             organizationId: finalOrganizationId,
             tableName: data.tableName,
             isDeleted: false,
        })

        assert(!getExistingtable, createError(StatusCodes.CONFLICT, "Table Name already exists"))


     // Generate fieldKey for each field based on fieldName (with spaces removed and converted to lowercase)
     const fieldsWithFieldKey = data.fields.map((field) => ({
        ...field,
        fieldKey: field.fieldName.replace(/ /g, '').toLowerCase(), // Remove spaces and convert to lowercase
    }));




        const newMstTable = new masterTableModel({
             organizationId: organizationId,
             codeGenerationType: data.codeGenerationType,
             tableCodeId: finalMSTCodeId,
             tableName: data.tableName,
             applicableTo: data.applicableTo,
             applicableId: data.applicableId,
             fields: fieldsWithFieldKey,
             addedByUserId:addedByUserId,
             createdAt: Date.now()
        })
        const savedMstTableColumn = await newMstTable.save();
        assert(
            savedMstTableColumn,
            createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout")
        );


        return savedMstTableColumn;
        }
        



/////////// generate SampleFile by table Id /////////
        
 masterTableService.generateSampelefile = async (tableId) => {

            const isExistTable = await masterTableModel.findOne({_id: tableId, isDeleted : false});

            assert(isExistTable, createError(StatusCodes.BAD_REQUEST, `No Master Table is exist with id ${tableId}`))


        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('MasterTable');
        // sheet headers
        const fields = isExistTable.fields;

    // Write headers to the Excel sheet
    const headers = fields.map((field) => {
        return field.depreciationType
            ? `${field.fieldName} (${field.depreciationType})`
            : field.fieldName;
    });
   const headerRow = worksheet.addRow(headers);

    // Set background color for the header row
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '19c37d' },
    };


    // Set font size for header cells
    headerRow.font = {
        size: 12,
        bold: true,
    };


    worksheet.columns.forEach((column, i) => {
        let maxLength = 0;
        column.eachCell((cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 20;
            if (columnLength > maxLength) {
                maxLength = columnLength;
            }
        });
        column.width = maxLength < 20 ? 20: maxLength;
    });



    // Add data validation to sheet columns based on data type for up to 1000 rows
    fields.forEach((field, index) => {
        const colNum = index + 1;
        let dataValidation;
        if (field.dataType === 'number') {
            dataValidation = {
                type: 'decimal',
                operator: 'greaterThan',
                formulae: [0],
                allowBlank: true,
                showErrorMessage: true,
                errorTitle: 'Invalid Data',
                error: 'Please enter a valid Rate.',
            };
        } else {
            // For alphanumeric data, specify a custom formula (text validation)
            dataValidation = {
                type: 'textLength',
                operator: 'lessThanOrEqual',
                formulae: [50], // Maximum text length allowed (adjust as needed)
                allowBlank: true,
                showErrorMessage: true,
                errorTitle: 'Invalid Data',
                error: 'Text is too long. Maximum length is 50 characters.',
            };
        }


        // Apply data validation to rows 2 to 1001 (1000 rows)
        for (let row = 1; row <= 1000; row++) {
            const cell = worksheet.getCell(row, colNum);
            cell.dataValidation = dataValidation;
        }
    });


    // Protect the worksheet to prevent editing in other cells
    worksheet.protect('Pushpa@1102');
    worksheet.sheetProtection.sheet = true;
    worksheet.sheetProtection.insertRows = false;
    worksheet.sheetProtection.formatCells = false;




    // Iterate over each row up to 1000 rows
    for (let rowNumber = 2; rowNumber <= 1000; rowNumber++) {
        const row = worksheet.getRow(rowNumber);

        // Iterate over each header cell
        headerRow.eachCell((headerCell, colNumber) => {
            const cell = row.getCell(colNumber);
            cell.protection = {
                locked: false
            };
        });
    }

    // remove white space from table name
        const sampleFileName = isExistTable.tableName.split(" ").join("");

        // Define the directory path
    const directoryPath = 'public/exports/masterTables';

    // Check if the directory exists, and if not, create it
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }


    // Save the Excel file in the directory
    const excelFilePath = `${directoryPath}/${sampleFileName}_SampleFile.xlsx`;
    const fileCreated = await workbook.xlsx.writeFile(excelFilePath);

       assert(!fileCreated, createError(StatusCodes.BAD_REQUEST, "Error in creating sample file for Master Table"))

        const fileUrl = secret.backend_baseURL+'/static/exports/masterTables/'+sampleFileName+'_'+'SampleFile'+'.xlsx';
        return  {'SampleFile':fileUrl,'tableCodeId':isExistTable.tableCodeId};
};


////////// upload table data ////////////
masterTableService.uploadMasterTableData = async (filePath, tableCodeId) => {

    assertEvery(
        [tableCodeId, filePath],
        createError(
            StatusCodes.BAD_REQUEST,
            "Invalid Data: tableCodeId and file must exist"
        )
    );

    const getTableId = await masterTableModel.findOne({tableCodeId: tableCodeId})
    assert(getTableId, createError(StatusCodes.BAD_REQUEST, `No table exist with tableCodeId ${tableCodeId}`))

    const tableId = getTableId._id;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Assuming you have a worksheet named 'MasterTable' in the Excel file
    const worksheet = workbook.getWorksheet('MasterTable');
    assert(worksheet, createError(StatusCodes.INTERNAL_SERVER_ERROR, "Error in uploading data. Worksheet 'MasterTable' not found in the Excel file."))

    // Assuming the headers are in the first row of the sheet
    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values;

    // Assuming the headers match your schema's field names and data types

    const data = [];

worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
    if (rowNumber > 1) { // Skip the header row
        const rowData = {};
        row.eachCell({ includeEmpty: false }, async (cell, colNumber) => {
            const header = headers[colNumber];
            const value = cell.value;

            if (header === 'ParentCode') {
                // Find and associate the ParentCode with its corresponding ID
                const parentObject = data.find((item) => item['Code No'] === value);
                if (parentObject) {
                    rowData[header] = parentObject._id;
                } else {
                    // Handle the case where no matching parentObject is found
                    rowData[header] = null;
                }
            } else {
                // Remove spaces and convert header to lowercase
                const formattedHeader = header.replace(/ /g, '').toLowerCase();
                rowData[formattedHeader] = value;
            }
        });

        // Generate a new MongoDB ObjectId for each row
        const newRow = {
            _id: new mongoose.Types.ObjectId(), // Assuming you're using Mongoose
            ...rowData
        };

        data.push(newRow);
    }
});
    // Perform data validation on 'data' if needed

    // update masterTabl3Data 
    const savedMasterTable = await masterTableModel.findOneAndUpdate({tableCodeId: tableCodeId},
        {
      masterTableData: data
    },
    { new: true }
    )

    assert(savedMasterTable, createError(StatusCodes.INTERNAL_SERVER_ERROR, "Error in uploading Data"))
    return savedMasterTable;
}



////// get all table //////////
masterTableService.getallTable = async (dashboardPermission, organizationId, publishStatus) => {
    let finalOrganizationId;

    if (dashboardPermission === 'root_dashboard') {
        finalOrganizationId = null;
    } else
    {
        finalOrganizationId = mongoose.Types.ObjectId(organizationId);
    }

    const query = {
        organizationId: finalOrganizationId,
        isDeleted: false
      };
      
      if (publishStatus) {
        query.publishStatus = publishStatus;
      }

    const allTables = await masterTableModel.find(query)
    .populate('addedByUserId', 'email userProfile.name')
    .select('_id tableCodeId tableName applicableTo applicableId publishStatus createdAt')

    assert(allTables, createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout"));


    const formattedResponse = allTables.map(table => ({
        _id: table._id,
        tableCodeId: table.tableCodeId,
        tableName: table.tableName,
        applicableTo: table.applicableTo,
        applicableId: table.applicableId,
        createdBy: table.addedByUserId.email, // Extract email from addedByUserId
        publishStatus: table.publishStatus,
        createdAt: table.createdAt,
      }));

      
     return formattedResponse;
}



///////// get single table data by Id ///////////
masterTableService.getSinlgleTable = async (mstId) => {
    
    const isExistTable = await masterTableModel.findOne({_id: mstId, isDeleted : false});

    assert(isExistTable, createError(StatusCodes.BAD_REQUEST, `No Master Table is exist with id ${mstId}`))

     const getTableData = await masterTableModel.findById(mstId)
     .select('_id tableName tableCodeId publishStatus fields masterTableData')

     assert(getTableData, createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout"));
     
      // Format the masterTableHeader as an object with key-value pairs
      const formattedMasterTableHeader = getTableData.fields.reduce((obj, field) => {
        if (field.depreciationType) {
            const depricatonMethod = field.depreciationType.replace(/ /g, '').toLowerCase()
            obj[`${field.fieldKey}(${depricatonMethod})`] = `${field.fieldKey} (${field.depreciationType})`;
        } else {
            obj[field.fieldKey] = field.fieldName;
        }
        return obj;
    }, {});
    
     const formatData = {
        _id:getTableData._id,
        tableCodeId: getTableData.tableCodeId,
        tableName: getTableData.tableName,
        publishStatus: getTableData.publishStatus,
        masterTableHeader: formattedMasterTableHeader,
        masterTableData:getTableData.masterTableData
     }
     return formatData;
}





///////////// get single row data by row id ////////////////
masterTableService.getSingleRow = async (tableId, rowId)=> {
   // Retrieve the existing document
   const existingDocument = await masterTableModel.findOne({_id : tableId, isDeleted: false});
   assert(existingDocument, createError(StatusCodes.BAD_REQUEST, `No Master Table is exist with id ${tableId}`))
    // Find the object within the masterTableData array using $elemMatch
    const objectData = existingDocument.masterTableData.find(
        (data) => data._id.toString() === rowId
    );

    assert(objectData, createError(StatusCodes.BAD_REQUEST, `No Row Data is exist with id ${rowId}`))
    return objectData;

}


  /////// modify obeject/row of  masterTableData array and create a new document ////////////////

masterTableService.modifyableData = async (updatedMasterTable, tableId, organizationId, addedByUserId)=> {
        // Retrieve the existing document
        const existingDocument = await masterTableModel.findById(tableId);
        assert(existingDocument, createError(StatusCodes.CONFLICT, `Table not found with id ${tableId}`))

        // Make a deep copy of the existing document
        const copiedDocument = JSON.parse(JSON.stringify(existingDocument));

        // Check if 'Code No' values are unique within the updated masterTable object
        const updatedCodes = new Set();
        for (const data of updatedMasterTable.masterTableData) {
            assert(!updatedCodes.has(data['codeno']), createError(StatusCodes.BAD_REQUEST, `Code No ${data['codeno']} is duplicated within the updated masterTable.`));
            updatedCodes.add(data['codeno']);
        }

        /// get organization name
        const organizationName = await globalDetails.getOrganizationName(
            organizationId
        );
   
       
        // add unique data and added by userId
        copiedDocument._id = mongoose.Types.ObjectId();
        copiedDocument.tableCodeId = await autoCodeGeneration.getmstCode(organizationName);
        copiedDocument.createdAt = Date.now();
        copiedDocument.addedByUserId = addedByUserId;
        copiedDocument.publishStatus = 'unpublished';

        // Update the masterTable in the copied document
        copiedDocument.masterTable = updatedMasterTable;

        // Save the copied document as a new document
        const newDocument = new masterTableModel(copiedDocument);
        const savedDocument = await newDocument.save();
        assert(savedDocument, createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout")); 
        return savedDocument;
}



////// publish draft table by Id ////////////////
masterTableService.publishTable = async (mstId)=> {
     // Update status 
     const updateStatus = await masterTableModel.findOneAndUpdate(
        {
            _id: mstId,
        },
        {
            publishStatus: "published"
        },
        { new: true }
    );
    assert(updateStatus, createError(StatusCodes.BAD_REQUEST, `No Master Table is exist with id ${mstId}`))

   return updateStatus;
}


//////// delete draft master table by id //////////
masterTableService.deleteDraft = async (tableId)=>{
    const isExistTable = await masterTableModel.findOne({_id: tableId});
    assert(isExistTable, createError(StatusCodes.BAD_REQUEST, `No Master Table is exist with id ${tableId}`))
    assert(isExistTable.publishStatus !== 'published', createError(StatusCodes.BAD_REQUEST, `Master Table with id ${tableId} is a published table`))
    //// delete
    const deleteTable = await masterTableModel.deleteOne({_id: tableId});
    assert(deleteTable, createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout"))
    return{"msg":"Draft Master Table Deleted Successfully"}
}




//////// delete published Master table by id ////////
masterTableService.deleteTable = async (mstId)=> {
    const isExistTable = await masterTableModel.findOneAndDelete({_id: mstId});
    assert(isExistTable, createError(StatusCodes.BAD_REQUEST, `No Master Table is exist with id ${mstId}`))
    return{"msg":"Master Table Deleted Successfully"}

}

export default masterTableService;