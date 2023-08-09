import StatusCodes from "http-status-codes";
import createError from "http-errors-lite";
import { assert, assertEvery } from "../../../helpers/mad-assert"; 
import { assetGroupModel } from "../models";


const assetGroupService = {};

// create new group
assetGroupService.createAssetGroup = async (
     name,
     assetCodeId,
     description,
     parentId,
     organizationId
) =>{

     assertEvery(
          [name, assetCodeId, description],
          createError(
            StatusCodes.BAD_REQUEST,
            "Invalid Data: [name], [assetCodeId], [description] fields must exist"
          )
        );

        const existingGroupName = await assetGroupModel.findOne({ 
           name,
           organizationId
      });
        assert(!existingGroupName, createError(StatusCodes.BAD_REQUEST, 'Asset Group name already exists'));

        const existingGroupCode = await assetGroupModel.findOne({ 
          assetCodeId,
          organizationId
      })
     assert(!existingGroupCode, createError(StatusCodes.BAD_REQUEST, "Asset Group Identification No. already exist"))

 if(parentId)
 {
    await assetGroupModel.findByIdAndUpdate(parentId,
     {isParent: true})
 }
 const newAssetGroup = new assetGroupModel({
     name,
     assetCodeId,
     organizationId,
     description,
     parentId: parentId ? parentId : null,
     createdAt: Date.now()

 })
 const savedassetGroup = await newAssetGroup.save();
      assert(
          savedassetGroup,
        createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout")
      );   

      return savedassetGroup;
}



// edit group data
assetGroupService.editAssetGroup = async (id, data, organizationId)=>{
  const assetGroupData = {};
  if(data.name)
  {
     assetGroupData.name = data.name;
     const existingGroupName = await assetGroupModel.findOne({
          name : assetGroupData.name,
          organizationId:organizationId,
          _id: { $ne: id },
          
     })
     assert(!existingGroupName, createError(StatusCodes.BAD_REQUEST, "Asset Group name already exist"))
  }
  if(data.assetCodeId)
  {
     assetGroupData.assetCodeId = data.assetCodeId;
     const existingGroupCode = await assetGroupModel.findOne({
          assetCodeId : assetGroupData.assetCodeId,
          organizationId:organizationId,
          _id: { $ne: id }
     })
     assert(!existingGroupCode, createError(StatusCodes.BAD_REQUEST, "Asset Group Identification No. already exist"))
  }
  if(data.description)
  {
     assetGroupData.description = data.description;
  }
  if(data.parentId)
  {
     assetGroupData.parentId = data.parentId;
     await assetGroupModel.findByIdAndUpdate(
         {_id: assetGroupData.parentId},
          {isParent: true})
  }
  assetGroupData.updatedAt = Date.now();

  const result = await assetGroupModel.findByIdAndUpdate(
     { _id: id },
     {
       $set: assetGroupData
     },
     { new: true }
   );

   assert(
     result,
   createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout")
 ); 
 return result;
}



/////////
assetGroupService.getAssetGroupsHierarchyByOrganizationId = async (organizationId) => {

          const assetGroups = await assetGroupModel.find(
               { organizationId }
               ).select({
                    organizationId: 0,
                    __v: 0,
                  });
              

          assert(assetGroups, createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout"))
          // Function to convert the asset groups into a hierarchical structure
          const convertToHierarchy = (nodes) => {
               const hierarchy = [];
               const map = new Map();

               nodes.forEach((node) => {
                    map.set(node._id.toString(), {
                         ...node.toObject(),
                         children: [],
                    });
               });

               nodes.forEach((node) => {
                    const parent = map.get(node._id.toString());

                    if (node.parentId) {
                         const parentassetGroup = map.get(
                              node.parentId.toString()
                         );
                         if (parentassetGroup) {
                              parentassetGroup.children.push(parent);
                         }
                    } else {
                         hierarchy.push(parent);
                    }
               });

               return hierarchy;
          };
          const hierarchicalLocations = convertToHierarchy(assetGroups);
          return hierarchicalLocations;   
};



////////
assetGroupService.getAssetGroupsByOrganizationId = async (organizationId) => {
     const assetGroups = await assetGroupModel.find(
          { organizationId }
          ).select({
               organizationId: 0,
               __v: 0,
             });
             assert(assetGroups, createError(StatusCodes.REQUEST_TIMEOUT, "Request Timeout"))
             return assetGroups;


}

export default assetGroupService;