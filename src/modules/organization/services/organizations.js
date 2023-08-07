import organizationModel from '../models/organizations.js';

const getOrganizations = async () => {
     try {
          const organizations = await organizationModel.find();

          return organizations;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to get  organizations');
     }
};

const getOrganiztionById = async (id) => {
     try {
          const organization = await organizationModel.findById(id);

          return organization;
     } catch (error) {
          console.log(error);
          throw new Error('Unable to get  organization by Id');
     }
};

export const organizationService = {
     getOrganizations,
     getOrganiztionById,
};
