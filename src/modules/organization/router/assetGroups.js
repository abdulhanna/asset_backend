import express from 'express';
import { assetGroupService } from '../services/assetGroups.js';

import { isLoggedIn } from '../../auth/router/passport.js';

import createAssetGroup from './createAssetGroup.js';

const router = express.Router();
// Create a new asset group
router.post('/', isLoggedIn, async (req, res) => {
     try {
          const { name, groupNestingId, description } = req.body;

          const newAssetGroup = await assetGroupService.createAssetGroup(
               name,
               groupNestingId,
               description
          );

          return res.status(201).json(newAssetGroup);
     } catch (error) {
          return res
               .status(500)
               .json({ error: 'Unable to create asset group' });
     }
});

router.get('/organization/:organizationId', isLoggedIn, async (req, res) => {
     try {
          const { organizationId } = req.params;
          // You can also add additional query parameters here if needed
          const assetGroups =
               await assetGroupService.getAssetGroupsByOrganizationId(
                    organizationId
               );
          return res.json(assetGroups);
     } catch (error) {
          return res.status(500).json({
               error: 'Unable to get asset groups by organizationId and criteria',
          });
     }
});

export default router;
