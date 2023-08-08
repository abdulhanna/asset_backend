import assetGroupModel from '../models/assetGroups.js';

const createAssetGroup = async (
     name,
     assetCodeId,
     description,
     groupNestingId,
     isGroupNesting
) => {
     try {
          if (groupNestingId) {
               // If groupNestingId is provided, update the isGroupNesting field of the parent asset group
               await assetGroupModel.findByIdAndUpdate(groupNestingId, {
                    isGroupNesting: true,
               });
          }

          const newAssetGroup = new assetGroupModel({
               name,
               assetCodeId,
               description,
               groupNestingId: isGroupNesting ? null : groupNestingId,
               isGroupNesting,
          });

          return await newAssetGroup.save();
     } catch (error) {
          throw new Error('Unable to create asset group');
     }
};

const getAssetGroupsByOrganizationId = async (
     organizationId
     /* Add any additional criteria here if required */
) => {
     try {
          const query = { organizationId };

          // Add any additional criteria to the query as needed

          const assetGroups = await assetGroupModel.find(query).exec();

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

                    if (node.groupNestingId) {
                         const parentGroup = map.get(
                              node.groupNestingId.toString()
                         );
                         if (parentGroup) {
                              parentGroup.children.push(parent); // Push the node into the parentGroup's children array
                         }
                    } else {
                         hierarchy.push(parent);
                    }
               });

               return hierarchy;
          };
          const hierarchicalAssetGroups = convertToHierarchy(assetGroups);

          return hierarchicalAssetGroups;
     } catch (error) {
          console.log(error);
          throw new Error(
               'Unable to get asset groups by organizationId and criteria'
          );
     }
};

export const assetGroupService = {
     createAssetGroup,
     getAssetGroupsByOrganizationId,
};
