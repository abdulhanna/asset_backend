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

export const organizationService = {
     getOrganizations,
};
