import StatusCodes from "http-status-codes";
import createError from "http-errors-lite";
import { assert } from "./mad-assert";
import { organizationModel } from "../modules/organization/models";

const getFirstWord = (inputString) => {
  const words = inputString.trim().split(/\s+/);
  return words.length > 0 ? words[0] : '';
};

const globalDetails = {};

globalDetails.getOrganizationName = async (organizationId) => {
  const getOrgName = await organizationModel.findOne({ 
    organizationId
  });
  assert(getOrgName, createError(StatusCodes.REQUEST_TIMEOUT, 'Request Timeout'));
  
  const firstWordGetOrgName = await getFirstWord(getOrgName.organizationName);
  return firstWordGetOrgName;
};

export default globalDetails;
