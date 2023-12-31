import {permissionModel} from '../models';

const createPermission = async (permissionData) => {
    try {
        const permission = await permissionModel.create(permissionData);

        return permission;
    } catch (error) {
        throw new Error(error.message);
    }
};

const updatePermission = async (id, updateData) => {
    try {
        const existingPermission = await permissionModel.findById(id);

        if (!existingPermission) {
            const error = new Error('Permission not found');
            error.statusCode = 404;
        }

        const updatedData = {
            updatedAt: new Date(),
            ...updateData,
        };

        // Handle access flags
        if (updateData.allAccess) {
            updatedData.allAccess = true;
            updatedData.removeAccess = false;
            updatedData.restoreDefaults = false;
            updatedData.read = true;
            updatedData.readWrite = true;
            updatedData.actions = true;
        } else if (updateData.removeAccess) {
            updatedData.allAccess = false;
            updatedData.removeAccess = true;
            updatedData.restoreDefaults = false;
            updatedData.read = false;
            updatedData.readWrite = false;
            updatedData.actions = false;
        } else if (updateData.restoreDefaults) {
            updatedData.allAccess = false;
            updatedData.removeAccess = false;
            updatedData.restoreDefaults = true;
        }

        return await permissionModel.findByIdAndUpdate(id, updatedData, {
            new: true,
        });
    } catch (error) {
        throw new Error(error.message);
    }
};

const getAllPermissions = async (page, limit, sortBy, sortOrder) => {
    try {

        const skip = (page - 1) * limit;
        let totalDocuments, totalPages, startSerialNumber, endSerialNumber, data;

        const filter = {isDeleted: false};

        data = await permissionModel
            .find(filter)
            .select('moduleName read readWrite actions allAccess removeAccess dashboardType _id createdAt isDeactivated')
            .sort(sortBy)
            .skip(skip)
            .limit(limit);

        totalDocuments = await permissionModel.countDocuments(filter);
        totalPages = Math.ceil(totalDocuments / limit);
        startSerialNumber = (page - 1) * limit + 1;
        endSerialNumber = Math.min(page * limit, totalDocuments);

        return {
            data,
            totalDocuments,
            totalPages,
            startSerialNumber,
            endSerialNumber,
        };
    } catch (error) {
        throw new Error(error.message);
    }
};


const getPermissionById = async (id) => {
    try {
        const permission = await permissionModel.findById({_id: id});
        return permission;
    } catch (error) {
        throw new Error(error.message);
    }

};

const softDeletePermissions = async (id) => {
    try {
        const softDeleteResult = await permissionModel.updateOne(
            {_id: id},
            {
                isDeleted: true,
                deletedAt: new Date()
            }
        );
        return softDeleteResult;
    } catch (error) {
        throw new Error('Error in soft deleting resource');
    }
};

const hardDeletePermissions = async (id) => {
    try {
        const hardDeleteResult = await permissionModel.deleteOne({_id: id});
        return hardDeleteResult;
    } catch (error) {
        throw new Error('Error in hard deleting resource');
    }
};

const getPermissionsByDashboardPermission = async (dashboardPermission) => {
    try {
        let dashboardType;

        if (dashboardPermission === 'root_dashboard') {
            dashboardType = 'root';
        } else {
            dashboardType = 'user';
        }

        const permissions = await permissionModel.find({dashboardType, isDeleted: false, isDeactivated: false});

        return permissions;
    } catch (error) {
        throw error;
    }
};

export const permissionService = {
    createPermission,
    updatePermission,
    getAllPermissions,
    softDeletePermissions,
    hardDeletePermissions,
    getPermissionsByDashboardPermission,
    getPermissionById
};
