import express from 'express';
import { locationService } from '../services/locations.js';

const router = express.Router();

// Route for creating a new location
router.post('/', async (req, res) => {
     try {
          const { name, industryType, assignedUser, address, children } =
               req.body;

          const newLocation = await locationService.createLocation(
               name,
               industryType,
               assignedUser,
               address,
               children
          );

          res.status(201).json(newLocation);
     } catch (error) {
          res.status(500).json({ error: 'Unable to create location' });
     }
});

// POST /api/locations/:parentId/add-child
router.post('/:parentId/add-child', async (req, res) => {
     try {
          const parentId = req.params.parentId;
          const newLocationData = req.body;
          const newLocation = await locationService.addChild(
               parentId,
               newLocationData
          );
          res.status(201).json(newLocation);
     } catch (err) {
          res.status(500).json({
               error: 'Failed to create location under the parent.',
          });
     }
});

router.get('/', async (req, res) => {
     try {
          const locations = await locationService.getLocations();

          res.status(200).json({
               success: true,
               locations,
          });
     } catch (error) {}
});

export default router;
