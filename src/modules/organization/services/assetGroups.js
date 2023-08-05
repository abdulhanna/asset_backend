import assetGroupModel from '../models/assetGroups.js';

const createAssetGroup = async (name, groupNestingId, description) => {
     try {
          if (groupNestingId) {
               // If groupNestingId is provided, update the isGroupNesting field of the parent asset group
               await assetGroupModel.findByIdAndUpdate(groupNestingId, {
                    isGroupNesting: true,
               });
          }

          const newAssetGroup = new assetGroupModel({
               name,
               groupNestingId: isGroupNesting ? null : groupNestingId,
               isGroupNesting,
               description,
          });

          return await newAssetGroup.save();
     } catch (error) {
          throw new Error('Unable to create asset group');
     }
};

const getAssetGroupsByOrganizationId = async (organizationId) => {
     try {
          const query = { organizationId };

          const assetGroups = await assetGroupModel
               .find(query)
               .select('-groupNestingId -__v')
               .exec();

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
                              parentGroup.children.push(parent);
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
