import mongoose from 'mongoose';

const assetFieldSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations', // Reference to the organization
        required: true,
    },
    assets: [
        //  {
        // assetIdentification: {
        //     basicAssetDetails: {
        //         name: String,
        //         assetSerialNo: String,
        //         assetId: String,
        //     },
        //     assetMeasurementsQuantity: {
        //         unitOfMeasurements: String,
        //         separateIdentification: Boolean,
        //         items: [{
        //             serialNumber: Number,
        //             itemId: String,
        //             ratePerPiece: Number,
        //         }],
        //     },
        //     assetComponents: {
        //         hasComponents: Boolean,
        //         mainAssetId: String,
        //         classOfAsset: String,
        //         productUsed: String,
        //     },
        //     assignAsset: {
        //         assignedTo: String,
        //     },
        //     attachments: {
        //         uploadAssetImages: [String],
        //         uploadDocuments: [String],
        //     },
        // },
        // ownershipDetails: {
        //     leaseDetails: {
        //         leaseType: String,
        //         lessorName: String,
        //         leasePeriod: String,
        //         leaseStartDate: Date,
        //         leaseEndDate: Date,
        //         leaseSpecialCondition: String,
        //         dueDate: Date,
        //     },
        //     ownershipType: String,
        //     lessorName: String,
        //     installHireAmount: Number,
        //     periodicity: String,
        //     attachments: {
        //         uploadOwnershipReceipt: [String],
        //         uploadLegalDocument: [String],
        //     },
        // },
        // assetAcquisition: {
        //     assetPurchase: {
        //         acquisitionDate: Date,
        //         capitalisationDate: Date,
        //         readyForUseDate: Date,
        //     },
        //     attachments: {
        //         uploadInvoice: [String],
        //     },
        //     futureAddition: {
        //         date: Date,
        //         applyAs: String,
        //         attachments: [String],
        //     },
        // },
        // costDetails: {
        //     acquisitionCost: Number,
        //     taxReimbursed: Number,
        //     otherCostReimbursed: Number,
        //     netCostOfAcquisition: Number,
        // },
        // warrantyInsurance: {
        //     warrantyDetails: {
        //         hasWarranty: Boolean,
        //         warrantyStartDate: Date,
        //         warrantyEndDate: Date,
        //         natureOfWarranty: String,
        //         contactPersonName: String,
        //         warrantyProvider: String,
        //         contactPersonEmail: String,
        //         contactNumber: String,
        //         utilizationAlerts: String,
        //     },
        //     insuranceDetails: {
        //         hasInsurance: Boolean,
        //         insurancePolicyNumber: String,
        //         insuranceProvider: String,
        //         insuranceTable: String,
        //     },
        // },
        // assetLocation: {
        //     locationDetails: {
        //         locationName: String,
        //         department: String,
        //         costCentre: String,
        //         gpsTracking: Boolean,
        //     },
        //     assetStatus: {
        //         currentStatus: String,
        //     },
        //     physicalVerification: {
        //         requiresVerification: Boolean,
        //     },
        //     remarks: [{
        //         remarkDate: Date,
        //         remarkFor: String,
        //         remarkFrom: String,
        //         remarkBy: String,
        //         remarkText: String,
        //     }],
        // },
        // depreciationDetails: {
        //     depreciationRule: String,
        //     accumulatedDepreciation: Number,
        //     cosActClassification: String,
        //     itActClassification: String,
        // },
        // maintenanceRepair: {
        //     maintenanceDetails: {
        //         maintenancePeriod: String,
        //         maintenanceDescription: String,
        //     },
        //     repairDetails: {
        //         hasExistingRecord: Boolean,
        //         repairStartDate: Date,
        //         repairEndDate: Date,
        //         typeOfRepair: String,
        //         repairAmount: Number,
        //         repairDescription: String,
        //         repairRemark: String,
        //     },
        //     attachments: {
        //         uploadInvoice: [String],
        //     },
        // },
        // saleDisposal: {
        //     disposalDetails: {
        //         disposalDescription: String,
        //         residualValue: Number,
        //         assetUsefulLife: Number,
        //         usefulLifePeriod: String,
        //     },
        //     saleDetails: {
        //         saleAmount: Number,
        //         saleDate: Date,
        //     },
        // },
        // },
    ],
});

const assetsModel = mongoose.model('assets', assetFieldSchema);

export default assetsModel;
