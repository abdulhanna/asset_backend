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
        // First, check if there are any existing assets with the same organizationId
        const existingAssets = await assetsModel.findOne({organizationId});

        if (existingAssets) {
            // If existing assets are found, replace them with the new ones
            await assetsModel.updateOne({organizationId}, {assets});
            return {message: 'Assets updated successfully'};
        } else {
            // If no existing assets are found, create new assets
            const result = await assetsModel.create({organizationId, assets});
            return result;
        }
    } catch (error) {
        throw new Error('Error saving assets to database');
    }
};


const updateAssetItems = async (organizationId, id, groupName, subgroupName, itemsData) => {
    try {
        const assetDocument = await assetsModel.findOneAndUpdate(
            {organizationId},
            {new: true}
        );

        if (!assetDocument) {
            throw new Error('Asset not found');
        }

        const asset = assetDocument.assets.find((asset) => asset._id.toString() === id);
        console.log(asset, 'asset before update');

        if (!asset) {
            throw new Error('Asset not found');
        }

        if (groupName === 'assetIdentification' && subgroupName === 'assetMeasurementsQuantity') {
            const updatedItems = itemsData.map((item) => ({
                serialNo: item.serialNo || null,
                uniqueItemId: item.uniqueItemId || null,
                ratePerPrice: item.ratePerPrice || null,
            }));
            console.log(updatedItems, 'updatedItems');

            if (!asset[groupName][subgroupName].itemsData) {
                asset[groupName][subgroupName].itemsData = [];
                console.log(asset[groupName][subgroupName].itemsData, 'checkItemData');
            }

            // Push each item individually
            updatedItems.forEach((item) => {
                asset[groupName][subgroupName].itemsData.push(item);
            });

            console.log(asset, 'asset after update'); // Log the asset after making changes

            // Save the changes to the assetDocument
            await assetDocument.save();

            return asset;
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error updating asset items');
    }
};

export const assetService = {
    createAsset,
    getAssetsByOrganization,
    saveAssetsToDatabase,
    updateAssetItems
};
