import express from 'express';
import { locationService } from '../services/locations.js';

const router = express.Router();

// Create a new location
router.post('/', async (req, res) => {
     try {
          const {
               name,
               organizationId,
               assignedUser,
               address,
               parentId,
               isParent,
          } = req.body;

          const newLocation = await locationService.createLocation(
               name,
               organizationId,
               assignedUser,
               address,
               parentId,
               isParent
          );

          res.status(201).json(newLocation);
     } catch (error) {
          res.status(500).json({ error: 'Unable to create location' });
     }
});

// Get a location by ID
router.get('/:locationId', async (req, res) => {
     try {
          const locationId = req.params.locationId;
          const location = await locationService.getLocationById(locationId);

          if (!location) {
               return res.status(404).json({ error: 'Location not found' });
          }

          res.json(location);
     } catch (error) {
          res.status(500).json({ error: 'Unable to get location' });
     }
});

router.get('/organization/:organizationId', async (req, res) => {
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
          res.json(locations);
     } catch (error) {
          res.status(500).json({
               error: 'Unable to get locations by organizationId and address criteria',
          });
     }
});

// Get all locations
router.get('/', async (req, res) => {
     try {
          const locations = await locationService.getAllLocations();
          res.json(locations);
     } catch (error) {
          res.status(500).json({ error: 'Unable to get locations' });
     }
});

// Update a location by ID
router.put('/:locationId', async (req, res) => {
     try {
          const locationId = req.params.locationId;
          const {
               name,
               organizationId,
               assignedUser,
               address,
               parentId,
               isParent,
          } = req.body;

          const updatedLocation = await locationService.updateLocation(
               locationId,
               name,
               organizationId,
               assignedUser,
               address,
               parentId,
               isParent
          );

          res.json(updatedLocation);
     } catch (error) {
          res.status(500).json({ error: 'Unable to update location' });
     }
});

// Delete a location by ID
router.delete('/:locationId', async (req, res) => {
     try {
          const locationId = req.params.locationId;
          await locationService.deleteLocation(locationId);

          res.json({ message: 'Location deleted successfully' });
     } catch (error) {
          res.status(500).json({ error: 'Unable to delete location' });
     }
});

export default router;
