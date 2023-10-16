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
        const formStepById = await assetFormStepModel.findById({_id: id});
        return formStepById;
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
    checkStepNoExists
};