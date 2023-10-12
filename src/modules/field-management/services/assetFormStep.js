import assetFormStepModel from '../models/assetFormStep';
import fieldManagementModel from '../models/fieldManagement';

const associateAssetFormStepWithGroups = async (stepNo, stepName, groups) => {
    try {
        const newAssetFormStep = new assetFormStepModel({stepNo, stepName});
        const assetFormStep = await newAssetFormStep.save();

        if (assetFormStep) {
            const promises = groups.map(async group => {
                const {groupId, orderNo} = group;

                const foundGroup = await fieldManagementModel.findById(groupId);

                if (foundGroup) {
                    foundGroup.assetFormStepId = assetFormStep._id;
                    foundGroup.orderNo = orderNo;

                    await foundGroup.save();

                } else {
                    throw new Error(`Group with ID ${groupId} not found`);
                }
            });

            await Promise.all(promises);
        } else {
            throw new Error('Failed to create AssetFormStep');
        }
    } catch (error) {
        throw error;
    }
};


export const assetFormStepService = {
    associateAssetFormStepWithGroups
};