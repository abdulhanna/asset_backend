import { locationModel } from '../models';

const createLocation = async (
     name,
     industryType,
     assignedUser,
     address,
     children
) => {
     try {
          const newLocation = new locationModel({
               name,
               industryType,
               assignedUser,
               address,
               children,
          });

          return await newLocation.save();
     } catch (error) {
          throw new Error('Unable to create location');
     }
};

const getLocations = async (req, res) => {
     try {
          const getLocations = await locationModel.find();
          return getLocations;
     } catch (error) {
          throw new Error('Error in get location');
     }
};

const addChild = async (parentId, newLocationData) => {
     try {
          newLocationData.parent = parentId; // Set the parent field to the provided parentId
          const newLocation = await locationModel.create(newLocationData);
          return newLocation;
     } catch (err) {
          throw new Error('Failed to create location under the parent.');
     }
};

export const locationService = {
     createLocation,
     getLocations,
     makeParent,
     addChild,
};
