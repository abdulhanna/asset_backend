import ExcelJS from "exceljs";
import fs from "fs";
import { secret } from "../config/secret";


const sheetValidation = {};
 
const getColumnLetter = (columnNumber)=> {
    let dividend = columnNumber;
    let columnName = '';
    let modulo;
  
    while (dividend > 0) {
      modulo = (dividend - 1) % 26;
      columnName = String.fromCharCode(65 + modulo) + columnName;
      dividend = Math.floor((dividend - modulo) / 26);
    }
  
    return columnName;
  }
 
 sheetValidation.validateExcelSheet =  async (filePath, realfileName)=> {
    try {


        const fileName = realfileName.split(" ").join("");
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0]; // Assuming you want to validate the first sheet
    
        // Get data validation rules from the first row
        const firstRow = worksheet.getRow(1);
        const dataValidationRules = [];
        firstRow.eachCell({ includeEmpty: false }, (cell) => {
          const validation = cell.dataValidation;
          dataValidationRules.push(validation);
        });
    
        // Perform data validation checks
        const validationErrors = [];
    
        worksheet.eachRow({ includeEmpty: false, skipNull: true }, (row, rowNumber) => {
          if (rowNumber > 1) {
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
              const cellAddress = `${getColumnLetter(colNumber)}${rowNumber}`;
              const validation = dataValidationRules[colNumber - 1];
              if (cell.value) {

                if (validation && (validation.type === 'whole' || validation.type === 'decimal')) {
                  // Check if the cell value matches the validation formula
                  if (typeof cell.value !== 'number') {
                   
                    // Set error message in the note of the cell
                    worksheet.getCell(cellAddress).note = {
                      texts: [
                       {
                          'font': {'size': 12, 'color': {'argb': '00000000'}, 'name': 'Calibri', 'family': 2, 'scheme': 'minor'},
                          'text': validation.error,
                        },
                      ],
                    };
                    validationErrors.push({ cellAddress, error: validation.error });    
                  }
                }
              }
              else {
                // Check if the column is mandatory and not allowed to be blank
                if (validation && (validation.allowBlank === false)) {
                  // Set an error message for blank mandatory columns
                  const mandatoryError = 'This field is mandatory and cannot be blank.';
                  worksheet.getCell(cellAddress).note = {
                    texts: [
                      {
                        'font': {'size': 12, 'color': {'argb': '00000000'}, 'name': 'Calibri', 'family': 2, 'scheme': 'minor'},
                        'text': mandatoryError,
                      },
                    ],
                  };
                  validationErrors.push({ cellAddress, error: mandatoryError });
                }
              } 

            });
          }
        });
    
        if (validationErrors.length > 0) {
      
             // Create a new workbook for validation errors
    const errorWorkbook = new ExcelJS.Workbook();
    const errorSheet = errorWorkbook.addWorksheet('Validation Errors');
    const headerRow = errorSheet.addRow(['Cell Address', 'Error Message']);

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

  errorSheet.columns.forEach((column, i) => {
    let maxLength = 0;
    column.eachCell((cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 30;
        if (columnLength > maxLength) {
            maxLength = columnLength;
        }
    });
    column.width = maxLength < 30 ? 30: maxLength;
});

    validationErrors.forEach((error) => {
      errorSheet.addRow([error.cellAddress, error.error]);
    });

    // Define the directory path for error files
    const errorDirectoryPath = 'public/exports/errorFiles';

    // Check if the directory exists, and if not, create it
    if (!fs.existsSync(errorDirectoryPath)) {
      fs.mkdirSync(errorDirectoryPath, { recursive: true });
    }

    // Save the error workbook as a separate file
    const errorFilePath = `${errorDirectoryPath}/${fileName.replace(/\.xlsx$/, '_errors.xlsx')}`;
    await errorWorkbook.xlsx.writeFile(errorFilePath);



    
              // Define the directory path
      const directoryPath = 'public/exports/masterTables';

    // Check if the directory exists, and if not, create it
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }


    // Save the Excel file in the directory
    const excelFilePath = `${directoryPath}/${fileName}`;

     // Save the modified workbook
       await workbook.xlsx.writeFile(excelFilePath);       

        const fileUrl = secret.backend_baseURL+'/static/exports/masterTables/'+fileName;
        const errorFileUrl = secret.backend_baseURL + '/static/exports/errorFiles/' + fileName.replace(/\.xlsx$/, '_errors.xlsx');

        return  {'uploadedFile':fileUrl, 'errorFile':errorFileUrl,'msg': 'The uploaded sheet contains validation errors, validation flags and error messages are added in the uploaded file, please review the file and make corrections accordingly', 'statusCode':1}; 

  }
      } catch (error) {
        return {'uploadedFile': '', 'errorFile':'','msg': 'Error reading or validating the Excel sheet', 'statusCode':1}
        
      }
  }


export default sheetValidation;