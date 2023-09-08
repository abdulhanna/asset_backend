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


export const assetFormManagementService = {
    pushFieldsToAssetForm
};