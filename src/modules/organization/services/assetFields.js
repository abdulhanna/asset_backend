import assetsModel from '../models/assetFields2';

const createAsset = async (organizationId, assetData) => {
    try {
        const organizationAssets = await assetsModel.findOne({organizationId});
        if (!organizationAssets) {
            return await assetsModel.create({organizationId, assets: [assetData]});
        }
        organizationAssets.assets.push(assetData);
        return await organizationAssets.save();
    } catch (error) {
        throw new Error('Error creating asset');
    }
};

const getAssetsByOrganization = async (organizationId) => {
    try {
        return await assetsModel.findOne({organizationId});

    } catch (error) {
        throw new Error('Error fetching assets');
    }
};


const saveAssetsToDatabase = async (organizationId, assets) => {
    try {
        const result = await assetsModel.create({organizationId, assets});
        return result;
    } catch (error) {
        throw new Error('Error saving assets to database');
    }
};

export const assetService = {
    createAsset,
    getAssetsByOrganization,
    saveAssetsToDatabase
};
