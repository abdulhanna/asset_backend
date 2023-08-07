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

router.get('/:id', isLoggedIn, async (req, res) => {
     try {
          const { id } = req.params;
          const organization = await organizationService.getOrganiztionById(id);

          return res.status(200).json({
               success: true,
               organization,
          });
     } catch (error) {
          return res.status(500).json({
               error: 'Unable to get organization by Id',
          });
     }
});

export default router;
