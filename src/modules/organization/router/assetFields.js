import express from 'express';
import { assetService } from '../services/assetFields';
const router = express.Router();

router.post('/assets', async (req, res) => {
     try {
          const newAsset = await assetService.createAsset(req.body);
          res.status(201).json(newAsset);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
});

router.put('/assets/:id', async (req, res) => {
     try {
          const updatedAsset = await assetService.updateAsset(
               req.params.id,
               req.body
          );
          res.json(updatedAsset);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
});

router.patch('/assets/:id', async (req, res) => {
     try {
          const updatedAsset = await assetService.updateDynamicField(
               req.params.id,
               req.body.subschemaKey,
               req.body.dynamicFieldData
          );
          res.json(updatedAsset);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
});

router.get('/assets', async (req, res) => {
     try {
          const assets = await assetService.getAllAssets();
          res.json(assets);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
});

router.get('/assets/:id', async (req, res) => {
     try {
          const asset = await assetService.getAssetById(req.params.id);
          res.json(asset);
     } catch (error) {
          res.status(404).json({ error: error.message });
     }
});

router.delete('/assets/:id', async (req, res) => {
     try {
          const deletedAsset = await assetService.deleteAsset(req.params.id);
          res.json(deletedAsset);
     } catch (error) {
          res.status(404).json({ error: error.message });
     }
});

export default router;
