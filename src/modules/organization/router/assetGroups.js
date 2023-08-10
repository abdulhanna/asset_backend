import { Router } from 'express';
import { httpHandler } from '@madhouselabs/http-helpers';
import StatusCodes from 'http-status-codes';
import assetGroupService  from '../services/assetGroups.js';
import { isLoggedIn } from '../../auth/router/passport.js';

const router = Router();

// Create a new asset group
router.post(
     "/add",
     isLoggedIn,
     httpHandler(async (req, res) => {
          const organizationId = req.user.data.organizationId;
          const {
               name,
               codeGenerationType,
               assetCodeId,
               description,
               parentId
          } = req.body;

      const result = await assetGroupService.createAssetGroup(name, codeGenerationType, assetCodeId, description, parentId, organizationId);
      res.status(StatusCodes.CREATED).send(result);
    
     })
   )

 
   // edit asset group
router.put(
     "/edit/:id",
     isLoggedIn,
     httpHandler(async (req, res) =>{
          const organizationId = req.user.data.organizationId;
          const result = await assetGroupService.editAssetGroup(req.params.id, req.body, organizationId);
          res.send(result)
     })
)   

// All asset group Hierarchy
router.get(
 "/hierarchy",
 isLoggedIn, 
httpHandler (async (req, res) => {
          const organizationId = req.user.data.organizationId;
          const assetGroups =  await assetGroupService.getAssetGroupsHierarchyByOrganizationId(organizationId);
               res.send(assetGroups);     
})
)

// All asset group without Hierarchy
router.get(
     "/",
     isLoggedIn, 
    httpHandler (async (req, res) => {
              const organizationId = req.user.data.organizationId;
              const assetGroups =  await assetGroupService.getAssetGroupsByOrganizationId(organizationId);
                   res.send(assetGroups);     
    })
    )


export default router;
