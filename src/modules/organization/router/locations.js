import express from 'express';
import { locationService } from '../services/locations.js';
import { isLoggedIn } from '../../auth/router/passport.js';

const router = express.Router();

// Create a new location
router.post('/', isLoggedIn, async (req, res) => {
     try {
          const organizationId = req.user.data.organizationId;
          const { name, assignedUserId, address, parentId, isParent } =
               req.body;

          const newLocation = await locationService.createLocation(
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
router.get('/:locationId', isLoggedIn, async (req, res) => {
     try {
          const locationId = req.params.locationId;
          const location = await locationService.getLocationById(locationId);

          if (!location) {
               return res.status(404).json({ error: 'Location not found' });
          }

          return res.json(location);
     } catch (error) {
          return res.status(500).json({ error: 'Unable to get location' });
     }
});

router.get('/organization/:organizationId', isLoggedIn, async (req, res) => {
     try {
          const { organizationId } = req.params;
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

// Update a location by ID
router.put('/:locationId', isLoggedIn, async (req, res) => {
     try {
          const locationId = req.params.locationId;
          const {
               name,
               organizationId,
               assignedUserId,
               address,
               parentId,
               isParent,
          } = req.body;

          const updatedLocation = await locationService.updateLocation(
               locationId,
               name,
               organizationId,
               assignedUserId,
               address,
               parentId,
               isParent
          );

          return res.json(updatedLocation);
     } catch (error) {
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
