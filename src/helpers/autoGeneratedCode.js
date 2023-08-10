
const autoCodeGeneration = {}



  autoCodeGeneration.getdepartmentCode = async(existingCodes, organizationName) => {
 //  Generate and log a unique code
 while (true) {
  const code = Math.floor(Math.random() * 90000) + 10000;
  if (!existingCodes.has(code)) {
    existingCodes.add(code);
    const codeId = organizationName+'-'+'DEP'+code;
    return codeId;
  }
}
}


 export default autoCodeGeneration;