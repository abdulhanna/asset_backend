import express from 'express';
import { organizationService } from '../services/organizations.js';
import { isLoggedIn } from '../../auth/router/passport.js';

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
     try {
          const organizations = await organizationService.getOrganizations();

          return res.status(200).json(organizations);
     } catch (error) {
          return res.status(500).json({
               error: 'Unable to get organizations',
          });
     }
});

export default router;
