import assetModel from '../models/assetFields';

const createAsset = async (assetData) => {
     try {
          const newAsset = new assetModel(assetData);
          const savedAsset = await newAsset.save();
          return savedAsset;
     } catch (error) {
          throw new Error('Error creating asset');
     }
};

const updateAsset = async (id, updatedAssetData) => {
     try {
          const updatedAsset = await assetModel.findByIdAndUpdate(
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
};

const updateDynamicField = async (id, subschemaKey, dynamicFieldData) => {
     try {
          const updatedAsset = await assetModel.findByIdAndUpdate(
               id,
               { $push: { [subschemaKey]: dynamicFieldData } },
               { new: true }
          );
          return updatedAsset;
     } catch (error) {
          throw new Error('Error updating dynamic field');
     }
};

const getAllAssets = async () => {
     try {
          const assets = await assetModel.find();
          return assets;
     } catch (error) {
          throw new Error('Error fetching assets');
     }
};

const getAssetById = async (id) => {
     try {
          const asset = await assetModel.findById(id);
          if (!asset) throw new Error('Asset not found');
          return asset;
     } catch (error) {
          throw new Error('Error fetching asset by ID');
     }
};

const deleteAsset = async (id) => {
     try {
          const deletedAsset = await assetModel.findByIdAndDelete(id);
          if (!deletedAsset) throw new Error('Asset not found');
          return deletedAsset;
     } catch (error) {
          throw new Error('Error deleting asset');
     }
};

export const assetService = {
     createAsset,
     updateAsset,
     updateDynamicField,
     getAllAssets,
     getAllAssets,
     getAssetById,
     deleteAsset,
};
