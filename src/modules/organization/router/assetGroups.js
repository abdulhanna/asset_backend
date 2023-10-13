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


// get assetGrp by Id
router.get(
 "/data/:id",
 isLoggedIn,
 httpHandler (async (req, res) => {
     const id = req.params.id;
     const result = await assetGroupService.getAssetGroupbyId(id);
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
        const currentPage = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.size) || 10;
        const sortBy = req.query.sort ? JSON.parse(req.query.sort) : 'createdAt';


        const organizationId = req.user.data.organizationId;
              const  assignedLocationId =  req.user.data.assignedLocationId;
              const assetGroups =  await assetGroupService.getAssetGroupsByOrganizationId(organizationId, assignedLocationId, currentPage, limit, sortBy);
              res.send(assetGroups);
    })
    )

  // Asset Groups for modal view in Admin dash

  router.get(
     "/modalView",
     isLoggedIn,
     httpHandler (async (req, res) => {
          const organizationId = req.user.data.organizationId;
          const assignedLocationId = req.user.data.assignedLocationId;
          const result = await assetGroupService.modalViewAssetgroups(organizationId, assignedLocationId);
          res.send(result)
     })
  )


  // Delete asset group
  router.delete(
     "/:id",
     isLoggedIn,
     httpHandler (async (req, res) => {
          const id = req.params.id;
          const result = await assetGroupService.deleteAssetgroup(id)
          res.send(result)
     })
  )


export default router;
