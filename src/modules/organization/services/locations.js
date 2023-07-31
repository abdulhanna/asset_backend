import { locationModel } from '../models';

const createLocation = async (
     name,
     organizationId,
     assignedUser,
     address,
     parentId,
     isParent
) => {
     try {
          const parent = isParent ? null : parentId;

          const newLocation = new locationModel({
               name,
               organizationId,
               assignedUser,
               address,
               parentId: parent,
               isParent,
          });

          return await newLocation.save();
     } catch (error) {
          throw new Error('Unable to create location');
     }
};

const getLocationById = async (locationId) => {
     try {
          return await locationModel.findById(locationId).exec();
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

          const locations = await locationModel.find(query).exec();

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
          return await locationModel.find().exec();
     } catch (error) {
          throw new Error('Unable to get locations');
     }
};

const updateLocation = async (
     locationId,
     name,
     organizationId,
     assignedUser,
     address,
     parentId,
     isParent
) => {
     try {
          const parent = isParent ? null : parentId;

          const location = await locationModel.findById(locationId).exec();

          if (!location) {
               throw new Error('Location not found');
          }

          location.name = name;
          location.organizationId = organizationId;
          location.assignedUser = assignedUser;
          location.address = address;
          location.parentId = parent;
          location.isParent = isParent;

          return await location.save();
     } catch (error) {
          throw new Error('Unable to update location');
     }
};

const deleteLocation = async (locationId) => {
     try {
          await locationModel.findByIdAndDelete(locationId).exec();
     } catch (error) {
          throw new Error('Unable to delete location');
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
};
