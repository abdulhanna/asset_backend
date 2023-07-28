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

export const locationService = {
     createLocation,
     getLocations,
};
