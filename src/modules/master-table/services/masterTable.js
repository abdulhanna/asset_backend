import StatusCodes from "http-status-codes";
import createError from "http-errors-lite";
import {assert, assertEvery} from "../../../helpers/mad-assert";
import masterTableModel from '../models/masterTable';


const masterTableService = {}

masterTableService.createMasterTable = async () => {

};

masterTableService.getallTable = async () => {

     const alltable = await masterTableModel.find();
     assert(alltable, createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout"));
     return alltable;
}


export default masterTableService;