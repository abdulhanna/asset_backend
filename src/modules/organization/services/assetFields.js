const Asset = require('./asset');

const assetService = {
     createAsset: async (assetData) => {
          try {
               const newAsset = new Asset(assetData);
               const savedAsset = await newAsset.save();
               return savedAsset;
          } catch (error) {
               throw new Error('Error creating asset');
          }
     },

     updateAsset: async (id, updatedAssetData) => {
          try {
               const updatedAsset = await Asset.findByIdAndUpdate(
                    id,
                    updatedAssetData,
                    {
                         new: true,
                    }
               );
               return updatedAsset;
          } catch (error) {
               throw new Error('Error updating asset');
          }
     },

     updateDynamicField: async (id, subschemaKey, dynamicFieldData) => {
          try {
               const updatedAsset = await Asset.findByIdAndUpdate(
                    id,
                    { $push: { [subschemaKey]: dynamicFieldData } },
                    { new: true }
               );
               return updatedAsset;
          } catch (error) {
               throw new Error('Error updating dynamic field');
          }
     },

     getAllAssets: async () => {
          try {
               const assets = await Asset.find();
               return assets;
          } catch (error) {
               throw new Error('Error fetching assets');
          }
     },

     getAssetById: async (id) => {
          try {
               const asset = await Asset.findById(id);
               if (!asset) throw new Error('Asset not found');
               return asset;
          } catch (error) {
               throw new Error('Error fetching asset by ID');
          }
     },

     deleteAsset: async (id) => {
          try {
               const deletedAsset = await Asset.findByIdAndDelete(id);
               if (!deletedAsset) throw new Error('Asset not found');
               return deletedAsset;
          } catch (error) {
               throw new Error('Error deleting asset');
          }
     },
};

module.exports = assetService;
