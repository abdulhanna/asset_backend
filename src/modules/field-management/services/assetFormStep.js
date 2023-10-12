import assetFormStepModel from '../models/assetFormStep';
import fieldManagementModel from '../models/fieldManagement';

const associateAssetFormStepWithGroups = async (stepNo, stepName, groups) => {
    try {
        const assetFormStep = await assetFormStepModel.findOne({stepNo, stepName});
        console.log(assetFormStep, 'assetFormStep');

        if (assetFormStep) {
            const promises = groups.map(async group => {
                const {groupId, orderNo} = group;

                const foundGroup = await fieldManagementModel.findById(groupId);

                if (foundGroup) {
                    foundGroup.assetFormStepId.push({
                        assetFormStep: assetFormStep._id,
                        orderNo
                    });
                    await foundGroup.save();
                } else {
                    throw new Error(`Group with ID ${groupId} not found`);
                }
            });

            await Promise.all(promises);
        } else {
            throw new Error('AssetFormStep not found');
        }
    } catch (error) {
        throw error;
    }
};

export const assetFormStepService = {
    associateAssetFormStepWithGroups
};