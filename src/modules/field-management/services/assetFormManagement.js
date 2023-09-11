import assetFormManagementModel from '../models/assetFormManagement';
import fieldManagementModel from '../models/fieldManagement';


const pushFieldsToAssetForm = async (organizationId) => {
    try {
        // Fetch fields from fieldManagementModel
        const fields = await fieldManagementModel.find();

        // Update assetFormManagementModel with the fieldList
        const result = await assetFormManagementModel.updateOne(
            {organizationId},
            {
                $push: {
                    assetFormManagements: {
                        $each: fields
                    }
                }
            },
            {upsert: true} // This option creates a new document if none exists
        );

        return result;
    } catch (error) {
        console.error('Error:', error);
    }
};

const getAssetFormManagementList = async () => {
    try {
        const data = await assetFormManagementModel.find();
        return data;

    } catch (error) {
        throw new Error('Error in getting asset form list');
    }
    return await assetFormManagementModel.find();
};

export const assetFormManagementService = {
    pushFieldsToAssetForm,
    getAssetFormManagementList
};