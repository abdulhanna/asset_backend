import { locationModel } from '../models';

const createLocation = async (
     locationName,
     industryType,
     assignedUser,
     address,
     children
) => {
     try {
          const newLocation = new locationModel({
               locationName,
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

export const locationService = {
     createLocation,
};
