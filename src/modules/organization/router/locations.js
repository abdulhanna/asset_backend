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

router.get('/', async (req, res) => {
     try {
          const getLocations = await locationService.getLocations();

          res.status(200).json({
               success: true,
               getLocations,
          });
     } catch (error) {}
});

export default router;
