
const autoCodeGeneration = {}


const existingCodes = new Set();  // Store already generated codes

  autoCodeGeneration.getdepartmentCode = async(organizationName) => {
 while (true) {
  const code = Math.floor(Math.random() * 90000) + 10000;
  if (!existingCodes.has(code)) {
    existingCodes.add(code);
    const codeId = organizationName+'-'+'DEP'+code;
    return codeId;
  }
}
}


autoCodeGeneration.getassetGrpCode = async(organizationName) => {
  while (true) {
   const code = Math.floor(Math.random() * 90000) + 10000;
   if (!existingCodes.has(code)) {
     existingCodes.add(code);
     const codeId = organizationName+'-'+'ASSETGRP'+code;
     return codeId;
   }
 }
 }



 autoCodeGeneration.getlocatinCode = async(organizationName) => {
  while (true) {
   const code = Math.floor(Math.random() * 90000) + 10000;
   if (!existingCodes.has(code)) {
     existingCodes.add(code);
     const codeId = organizationName+'-'+'LOC'+code;
     return codeId;
   }
 }
 }



/////////// master table strucutures /////////////
 autoCodeGeneration.getmtsCode = async(organizationName) => {
  while (true) {
    const code = Math.floor(Math.random() * 90000) + 10000;
    if (!existingCodes.has(code)) {
        existingCodes.add(code);
        let codeId;
        if(organizationName)
        {
             codeId = organizationName+'-'+'MTS'+code;
        }
        else
        {
             codeId = 'Default'+'-'+'MTS'+code;
        }

        return codeId;
    }
}


 }


 //////////// master Tables ///////////
 autoCodeGeneration.getmstCode = async(organizationName) => {
     while (true) {
         const code = Math.floor(Math.random() * 90000) + 10000;
         if (!existingCodes.has(code)) {
             existingCodes.add(code);
             let codeId;
             if(organizationName)
             {
                  codeId = organizationName+'-'+'MST'+code;
             }
             else
             {
                  codeId = 'Default'+'-'+'MST'+code;
             }

             return codeId;
         }
     }

 }

 export default autoCodeGeneration;