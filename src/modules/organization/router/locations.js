import express from 'express';
import { locationService } from '../services/locations.js';
import { isLoggedIn } from '../../auth/router/passport.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/add', isLoggedIn, async (req, res) => {
     try {
          const organizationId = req.user.data.organizationId;
          let {
               autoCodeGeneration,
               locationCodeId,
               name,
               assignedUserId,
               address,
               parentId,
               isParent,
          } = req.body;

          // Set default value for autoCodeGeneration if not provided
          autoCodeGeneration =
               autoCodeGeneration !== undefined ? autoCodeGeneration : true;

          // Check if locationCodeId already exists
          if (!autoCodeGeneration) {
               if (!locationCodeId) {
                    return res.status(400).json({
                         error: `locationCodeId is required when autoCodeGeneration is false`,
                    });
               }

               const locationCodeExists =
                    await locationService.checkLocationCodeIdExists(
                         locationCodeId
                    );
               if (locationCodeExists) {
                    return res.status(400).json({
                         error: `Location code already exists`,
                    });
               }
          } else {
               locationCodeId = locationService.generateAutomaticCode();
          }

          const newLocation = await locationService.createLocation(
               autoCodeGeneration,
               locationCodeId,
               name,
               organizationId,
               assignedUserId,
               address,
               parentId,
               isParent
          );

          return res.status(201).json(newLocation);
     } catch (error) {
          return res.status(500).json({ error: 'Unable to create location' });
     }
});

// Get a location by ID
router.get('/:id', isLoggedIn, async (req, res) => {
     try {
          const id = req.params.id;
          const location = await locationService.getLocationById(id);

          if (!location) {
               return res.status(404).json({ error: 'Location not found' });
          }

          return res.json(location);
     } catch (error) {
          return res.status(500).json({ error: 'Unable to get location' });
     }
});

router.get('/v1/hierarchy', isLoggedIn, async (req, res) => {
     try {
          const organizationId = req.user.data.organizationId;
          const { city, state, country } = req.query;

          const locations =
               await locationService.getLocationsByOrganizationIdV2(
                    organizationId,
                    city,
                    state,
                    country
               );
          return res.json(locations);
     } catch (error) {
          return res.status(500).json({
               error: 'Unable to get locations by organizationId and address criteria',
          });
     }
});

// Get all locations
router.get('/', isLoggedIn, async (req, res) => {
     try {
          const locations = await locationService.getAllLocations();
          return res.json(locations);
     } catch (error) {
          return res.status(500).json({ error: 'Unable to get locations' });
     }
});

const isValidObjectId = (id) => {
     return mongoose.Types.ObjectId.isValid(id);
};
// Update a location by ID
// Your existing route setup
router.put('/:id', isLoggedIn, async (req, res) => {
     try {
          const id = req.params.id;
          const {
               name,
               organizationId,
               assignedUserId,
               address,
               parentId,
               isParent,
               locationCodeId,
          } = req.body;

          // Custom validation for the update permission request
          if (!isValidObjectId(id)) {
               return res.status(400).json({
                    success: false,
                    error: 'Invalid location ID',
               });
          }

          // Check if the provided ID exists
          const existingLocation = await locationService.getLocationById(id);
          if (!existingLocation) {
               return res.status(404).json({ error: 'Location not found' });
          }

          // Validate locationCodeId if it's provided in the request body
          if (
               locationCodeId &&
               locationCodeId !== existingLocation.locationCodeId
          ) {
               const codeExists =
                    await locationService.checkLocationCodeIdExists(
                         locationCodeId
                    );
               if (codeExists) {
                    return res
                         .status(400)
                         .json({ error: 'Location code already exists' });
               }
          }

          const updatedLocation = await locationService.updateLocation(
               id,
               name,
               organizationId,
               assignedUserId,
               address,
               parentId,
               isParent,
               locationCodeId
          );

          return res.status(200).json(updatedLocation);
     } catch (error) {
          console.log(error);
          return res.status(500).json({ error: 'Unable to update location' });
     }
});

router.delete('/:id', isLoggedIn, async (req, res) => {
     try {
          const { id } = req.params;
          const organizationId = req.user.data.organizationId;

          const deletedLocation = await locationService.deleteLocation(
               id,
               organizationId
          );

          if (!deletedLocation) {
               return res.status(404).json({
                    success: false,
                    error: 'Location not found or not accessible.',
               });
          }

          return res.status(200).json({
               success: true,
               msg: 'Location deleted successfully (soft delete)',
               location: deletedLocation,
          });
     } catch (error) {
          console.log(error);
          return res.status(500).json({
               success: false,
               error: 'Unable to delete location (soft delete)',
          });
     }
});

export default router;
