import { locationModel } from '../models';

const generateAutomaticCode = () => {
     const prefix = 'LOC';
     const randomDigits = Math.floor(10000 + Math.random() * 90000);
     return prefix + randomDigits;
};

const createLocation = async (
     locationCodeId,
     codeGenerationType,
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
               locationCodeId,
               codeGenerationType,
               name,
               organizationId,
               assignedUserId,
               address,
               parentId: isParent ? null : parentId,
               isParent,
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
          const query = { organizationId };

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
          const query = { organizationId };

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
               .select('-address -organizationId  -__v')
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
     isParent
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

// const axios = require('axios');

// const createLocations = async (
//      name,
//      industryType,
//      assignedUser,
//      address,
//      children
// ) => {
//      try {
//           // Assuming 'address' is an object containing city, state, country, etc.
//           const fullAddress = `${address.city}, ${address.state}, ${address.country}`;
//           const encodedAddress = encodeURIComponent(fullAddress);

//           // Use your Google Maps Geocoding API key here
//           const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';

//           // Fetch latitude and longitude using the Google Maps Geocoding API
//           const geocodeResponse = await axios.get(
//                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
//           );

//           const location = geocodeResponse.data.results[0].geometry.location;
//           const latitude = location.lat;
//           const longitude = location.lng;

//           const newLocation = new locationModel({
//                name,
//                industryType,
//                assignedUser,
//                address,
//                latitude,
//                longitude,
//                children,
//           });

//           return await newLocation.save();
//      } catch (error) {
//           throw new Error('Unable to create location');
//      }
// };

export const locationService = {
     createLocation,
     getLocationById,
     getLocationsByOrganizationId,
     getLocationsByOrganizationIdV2,
     getAllLocations,
     updateLocation,
     deleteLocation,
     generateAutomaticCode,
};
