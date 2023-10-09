import { locationModel } from '../models';

const checkLocationCodeIdExists = async (locationCodeId) => {
     const existingLocation = await locationModel.findOne({ locationCodeId });
     return !!existingLocation; // Return true if a location with the given codeId exists, otherwise false
};

const createLocation = async (
     codeGenerationType,
     locationCodeId,
     name,
     organizationId,
     assignedUserId,
     address,
     parentId,
     isParent
) => {
     try {
          if (parentId) {
               // If parentId is provided, update the isParent field of the parent location
               await locationModel.findByIdAndUpdate(parentId, {
                    isParent: true,
               });
          }

          const newLocation = new locationModel({
               codeGenerationType,
               locationCodeId,
               name,
               organizationId,
               assignedUserId,
               address,
               parentId: isParent ? null : parentId,
               isParent,
               createdAt: Date.now()
          });

          return await newLocation.save();
     } catch (error) {
          console.log(error);
          throw new Error('Unable to create location');
     }
};

const getLocationById = async (id) => {
     try {
          return await locationModel.findById({ _id: id }).exec();
     } catch (error) {
          throw new Error('Unable to get location');
     }
};

const getLocationsByOrganizationIdV2 = async (
     organizationId,
     city,
     state,
     country
) => {
     try {
          const query = { organizationId, isDeleted: false };

          if (city) {
               query['address.city'] = city;
          }

          if (state) {
               query['address.state'] = state;
          }

          if (country) {
               query['address.country'] = country;
          }

          const locations = await locationModel
               .find(query)
               .select('-address -organizationId  -__v')
               .populate('assignedUserId', 'email userProfile.name')
               .exec();

          // Function to convert the locations into a hierarchical structure
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
                         const parentLocation = map.get(
                              node.parentId.toString()
                         );
                         if (parentLocation) {
                              parentLocation.children.push(parent);
                         }
                    } else {
                         hierarchy.push(parent);
                    }
               });

               return hierarchy;
          };
          const hierarchicalLocations = convertToHierarchy(locations);

          return hierarchicalLocations;
     } catch (error) {
          console.log(error);
          throw new Error(
               'Unable to get locations by organizationId and address criteria'
          );
     }
};

const getLocationsByOrganizationId = async (
     organizationId,
     city,
     state,
     country
) => {
     try {
          //   console.log('city', city);
          const query = { organizationId, isDeleted: false };

          if (city) {
               query['address.city'] = city;
          }

          if (state) {
               query['address.state'] = state;
          }

          if (country) {
               query['address.country'] = country;
          }

          return await locationModel.find(query).exec();
     } catch (error) {
          throw new Error(
               'Unable to get locations by organizationId and address criteria'
          );
     }
};

const getAllLocations = async () => {
     try {
          return await locationModel
               .find({ isDeleted: false })
               .populate('assignedUserId', 'email userProfile.name')
               .select('-address -organizationId  -isDeleted -deletedAt -__v')
               .exec();
     } catch (error) {
          throw new Error('Unable to get locations');
     }
};

const updateLocation = async (
     id,
     name,
     organizationId,
     assignedUserId,
     address,
     parentId,
     isParent,
     locationCodeId
) => {
     try {
          const parent = isParent ? null : parentId;

          const updateObject = {}; // Initialize an empty update object

          // Check each field and add it to the updateObject if it's provided
          if (name !== undefined) {
               updateObject.name = name;
          }
          if (organizationId !== undefined) {
               updateObject.organizationId = organizationId;
          }
          if (assignedUserId !== undefined) {
               updateObject.assignedUserId = assignedUserId;
          }
          if (address !== undefined) {
               updateObject.address = address;
          }
          if (parent !== undefined) {
               updateObject.parentId = parent;
          }
          if (isParent !== undefined) {
               updateObject.isParent = isParent;
          }

          if (locationCodeId !== undefined) {
               updateObject.locationCodeId = locationCodeId;
          }

          updateObject.updatedAt = Date.now();

          const location = await locationModel
               .findByIdAndUpdate(
                    { _id: id },
                    updateObject,
                    { new: true } // To return the updated document
               )
               .exec();

          if (!location) {
               throw new Error('Location not found');
          }

          return location;
     } catch (error) {
          throw new Error('Unable to update location');
     }
};

const deleteLocation = async (id, organizationId) => {
     try {
          // Validate if the location exists and is accessible to the admin
          const location = await locationModel.findOne({
               _id: id,
               organizationId,
          });

          if (!location) {
               return null;
          }

          // Perform the soft delete
          location.isDeleted = true;
          location.deletedAt = new Date();

          // Save the updated location
          const deletedLocation = await location.save();
          return deletedLocation;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to soft delete location');
     }
};

// add asset Group in locations

const addlocationassetGroup = async (locationId, data) => {
     try {
          const assetgroupIds = data.assetgroups;
          // Fetch the location by its ID from the database
          const location = await locationModel.findById(locationId);

          if (!location) {
               throw new Error('Location not found or not accessible.');
          }

          // Add only new asset groups to the location's assetgroups array
          assetgroupIds.forEach((assetgroupId) => {
               const existingAssetGroup = location.assetgroups.find((group) =>
                    group.assetgroupId.equals(assetgroupId)
               );

               if (!existingAssetGroup) {
                    location.assetgroups.push({ assetgroupId });
               }
          });
          // Save the updated location
          const updatedLocation = await location.save();
          return updatedLocation;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to Add Asset Group');
     }
};

const removeAssetGroupFromLocation = async (
     locationId,
     assetgroupIdToRemove
) => {
     try {
          // Fetch the location by its ID from the database
          const location = await locationModel.findById(locationId);

          if (!location) {
               throw new Error('Location not found or not accessible.');
          }

          // Find the index of the asset group to remove
          const indexToRemove = location.assetgroups.findIndex((group) =>
               group.assetgroupId.equals(assetgroupIdToRemove)
          );

          if (indexToRemove !== -1) {
               // Remove the asset group from the array
               location.assetgroups.splice(indexToRemove, 1);
               // Save the updated location
               const updatedLocation = await location.save();
               return updatedLocation;
          } else {
               throw new Error('Asset group not found in location.');
          }
     } catch (error) {
          console.log(error);
          throw new Error('Unable to Delete Asset Group');
     }
};

export const locationService = {
     createLocation,
     getLocationById,
     getLocationsByOrganizationId,
     getLocationsByOrganizationIdV2,
     getAllLocations,
     updateLocation,
     deleteLocation,
     checkLocationCodeIdExists,
     addlocationassetGroup,
     removeAssetGroupFromLocation,
};
