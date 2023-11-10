import assetFormStepModel from '../models/assetFormStep';
import fieldManagementModel from '../models/fieldManagement';


const checkStepNoExists = async (stepNo) => {
    try {
        const existingStep = await assetFormStepModel.findOne({stepNo});
        return !!existingStep; // Returns true if stepNo exists, false if not
    } catch (error) {
        throw error;
    }
};
const checkGroupHasAssetFormStep = async (groupId) => {
    try {
        const foundGroup = await fieldManagementModel.findOne({_id: groupId, assetFormStepId: {$ne: null}});
        return foundGroup;
    } catch (error) {
        throw new Error(`Error finding group with ID ${groupId}: ${error.message}`);
    }
};

const getListOfGroups = async () => {
    try {
        const groups = await fieldManagementModel.find().populate('assetFormStepId');

        const filteredGroups = groups.map(group => {
            return {
                _id: group._id,
                groupName: group.groupName,
                assetFormStep: group.assetFormStepId ? {
                    _id: group.assetFormStepId._id,
                    stepNo: group.assetFormStepId.stepNo,
                    stepName: group.assetFormStepId.stepName
                } : null
            };
        });

        return {filteredGroups,};
    } catch (error) {
        return {groups: null, error: error.message}; // Return error if an exception occurs
    }
};


const associateAssetFormStepWithGroups = async (stepNo, stepName, groups) => {
    try {
        const newAssetFormStep = new assetFormStepModel({stepNo, stepName, createdAt: new Date()});
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

const listForms = async (page, limit, sortBy) => {
    try {

        const skip = (page - 1) * limit;
        const filter = {isDeleted: false};

        let totalDocuments, totalPages, startSerialNumber, endSerialNumber, data;

        const forms = await assetFormStepModel.find(filter).sort(sortBy).limit(limit);

        totalDocuments = await assetFormStepModel.countDocuments(filter);
        totalPages = Math.ceil(totalDocuments / limit);
        startSerialNumber = (page - 1) * limit + 1;
        endSerialNumber = Math.min(page * limit, totalDocuments);

        const formsWithGroupCount = await Promise.all(forms.map(async (form) => {
            const formCount = await fieldManagementModel.countDocuments({
                assetFormStepId: form._id
            });
            return {
                ...form.toObject(),
                groupsCount: formCount
            };
        }));

        return {
            data: formsWithGroupCount, // Changed this line to return formsWithGroupCount
            totalDocuments,
            totalPages,
            startSerialNumber,
            endSerialNumber
        };
    } catch (error) {
        throw error;
    }
};

const getFormStepById = async (id) => {
    try {
        // Find the asset form step by its Id
        const step = await assetFormStepModel.findOne({_id: id});

        if (!step) {
            throw new Error(`Step with ID ${id} not found`);
        }

        const groups = await fieldManagementModel.find({assetFormStepId: id})
            .select('_id orderNo groupName isMandatory');

        const response = {
            stepNo: step.stepNo,
            stepName: step.stepName,
            groups: groups.map(group => ({
                groupId: group._id,
                groupName: group.groupName,
                isMandatory: group.isMandatory,
                orderNo: group.orderNo,
            })),
        };

        return response;
    } catch (error) {
        throw error;
    }
};

const checkDuplicateGroup = async (formId, groups) => {
    try {
        const promises = groups.map(async (group) => {
            const {groupId} = group;

            // Check if the group is already associated with another step
            const existingGroup = await fieldManagementModel.findOne({
                _id: groupId,
                assetFormStepId: {$ne: formId},
            });

            return !!existingGroup; // Returns true if the group is already associated with another step, false otherwise
        });

        const results = await Promise.all(promises);
        return results.includes(true);
    } catch (error) {
        throw error;
    }
};


const updateForm = async (formId, stepNo, stepName, groups) => {
    try {
        const updatedForm = await assetFormStepModel.findByIdAndUpdate(formId, {stepNo, stepName}, {new: true});

        if (updatedForm) {
            const promises = groups.map(async group => {
                const {groupId, orderNo} = group;

                const foundGroup = await fieldManagementModel.findById(groupId);

                if (foundGroup) {
                    foundGroup.assetFormStepId = updatedForm._id;
                    foundGroup.orderNo = orderNo;
                    await foundGroup.save();
                } else {
                    throw new Error(`Group with ID ${groupId} not found`);
                }
            });

            await Promise.all(promises);
        } else {
            throw new Error(`Form with ID ${formId} not found`);
        }
    } catch (error) {
        throw error;
    }
};


const deleteForm = async (formId) => {
    try {
        const deletedForm = await assetFormStepModel.findByIdAndDelete(formId);

        if (!deletedForm) {
            throw new Error(`Form with ID ${formId} not found`);
        }

        const associatedGroups = await fieldManagementModel.find({assetFormStepId: formId});

        const promises = associatedGroups.map(async group => {
            group.assetFormStepId = null;
            group.orderNo = null;
            await group.save();
        });

        await Promise.all(promises);
    } catch (error) {
        throw error;
    }
};
export const assetFormStepService = {
    associateAssetFormStepWithGroups,
    listForms,
    updateForm,
    deleteForm,
    getFormStepById,
    checkStepNoExists,
    getListOfGroups,
    checkGroupHasAssetFormStep,
    checkDuplicateGroup

};
