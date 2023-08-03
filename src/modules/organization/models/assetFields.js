// asset.js
import mongoose from 'mongoose';

// Define a generic dynamic field schema
const dynamicFieldSchema = new mongoose.Schema({
     fieldName: { type: String, required: true },
     fieldType: { type: String, required: true },
     fieldLength: { type: Number },
     listOptions: [{ type: String }], // Optional - list of options for dropdown/select fields
     isMandatory: { type: Boolean, default: false },
});

// Subschema for Asset Description
const assetDescriptionSchema = new mongoose.Schema({
     assetName: { type: String, required: true },
     assetDescription: { type: String },
     dynamicFields: [dynamicFieldSchema],
});

// Subschema for Asset Acquisition
const assetAcquisitionSchema = new mongoose.Schema({
     purchaseDate: { type: Date },
     capitalisationDate: { type: Date },
     estimatedRateOfCompletion: { type: Number },
     uom: { type: String }, // Unit of Measurement
     numOfItems: { type: Number },
     dynamicFields: [dynamicFieldSchema],
});

// Subschema for Cost Details
const costDetailsSchema = new mongoose.Schema({
     costOfAcquisition: { type: Number },
     additions: { type: Number },
     grouping: { type: String },
     components: { type: String },
     industryUsed: { type: String },
     dynamicFields: [dynamicFieldSchema],
});

// Subschema for Location
const locationSchema = new mongoose.Schema({
     location: { type: String },
     department: { type: String },
     costCentre: { type: String },
     dynamicFields: [dynamicFieldSchema],
});

// Subschema for Depreciation Details
const depreciationDetailsSchema = new mongoose.Schema({
     accumulatedDepreciation: { type: Number },
     depreciationRule: { type: String },
     cosActClassification: { type: String },
     itActClassification: { type: String },
     amendInDepRateItAct: { type: Boolean },
     rateOfCharge: { type: Number },
     amendInDepRate: { type: Boolean },
     changeInDepProspective: { type: Boolean },
     effectiveDate: { type: Date },
     dynamicFields: [dynamicFieldSchema],
});

// Subschema for Ownership Details
const ownershipDetailsSchema = new mongoose.Schema({
     leaseType: { type: String },
     lessorName: { type: String },
     leasePeriod: { type: Number },
     leaseEndDate: { type: Date },
     leaseSplCondition: { type: String },
     leasePremium: { type: Number }, // For finance lease
     dynamicFields: [dynamicFieldSchema],
});

// Subschema for Disposal Details
const disposalDetailsSchema = new mongoose.Schema({
     disposalDetails: { type: String },
     residualValue: { type: Number },
     assetUsefulLife: { type: Number },
     dynamicFields: [dynamicFieldSchema],
});

// Subschema for Charge Details
const chargeDetailsSchema = new mongoose.Schema({
     chargeName: { type: String },
     chargeAmount: { type: Number },
     chargeCreation: { type: Date },
     chargeSatisfaction: { type: Date },
     loanAmount: { type: Number },
     dynamicFields: [dynamicFieldSchema],
});

// Subschema for Warranty Details
const warrantyDetailsSchema = new mongoose.Schema({
     warranty: { type: Boolean },
     warrantyStartDate: { type: Date },
     warrantyEndDate: { type: Date },
     warrantyContactPersonName: { type: String },
     warrantyContactPersonTelephone: { type: String },
     dynamicFields: [dynamicFieldSchema],
});

// Subschema for Insurance Details
const insuranceDetailsSchema = new mongoose.Schema({
     insurance: { type: Boolean },
     insurancePolicyNo: { type: String },
     insuranceStartDate: { type: Date },
     insuranceNature: { type: String },
     insuranceContactPersonName: { type: String },
     insuranceContactPersonTelephone: { type: String },
     dynamicFields: [dynamicFieldSchema],
});

// Subschema for Repair & Maintenance Details
const repairMaintenanceDetailsSchema = new mongoose.Schema({
     maintenanceHistory: { type: String },
     currentStatus: {
          type: String,
          enum: ['ACTIVE', 'SPARE', 'HELD FOR SALE', 'RENOVATION'],
     },
     remark: { type: String },
     dynamicFields: [dynamicFieldSchema],
});

// Subschema for Sale/Disposal Details
const saleDisposalDetailsSchema = new mongoose.Schema({
     saleAmount: { type: Number },
     saleDate: { type: Date },
     netBookValue: { type: Number },
     dynamicFields: [dynamicFieldSchema],
});

const assetSchema = new mongoose.Schema(
     {
          assetDescription: assetDescriptionSchema,
          assetAcquisition: assetAcquisitionSchema,
          costDetails: costDetailsSchema,
          location: locationSchema,
          depreciationDetails: depreciationDetailsSchema,
          ownershipDetails: ownershipDetailsSchema,
          disposalDetails: disposalDetailsSchema,
          chargeDetails: chargeDetailsSchema,
          warrantyDetails: warrantyDetailsSchema,
          insuranceDetails: insuranceDetailsSchema,
          repairMaintenanceDetails: repairMaintenanceDetailsSchema,
          saleDisposalDetails: saleDisposalDetailsSchema,
          //dynamicFields: [dynamicFieldSchema], // Add dynamic fields to this array
     },
     { timestamps: true }
);

const assetModel = mongoose.model('assets', assetSchema);

export default assetModel;

/* 

import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
     {
          // Asset Description
          name: { type: String, required: true },
          assetDescription: { type: String },

          // Asset Acquisition
          purchaseDate: { type: Date },
          capitalisationDate: { type: Date },
          estimatedRateOfCompletion: { type: Number },
          uom: { type: String }, // Unit of Measurement
          numOfItems: { type: Number },

          // Cost Details
          costOfAcquisition: { type: Number },
          additions: { type: Number },
          grouping: { type: String },
          components: { type: String },
          industryUsed: { type: String },

          // Location
          location: { type: String },
          department: { type: String },
          costCentre: { type: String },

          // Depreciation Details
          accumulatedDepreciation: { type: Number },
          depreciationRule: { type: String },
          cosActClassification: { type: String },
          itActClassification: { type: String },
          amendInDepRateItAct: { type: Boolean },
          rateOfCharge: { type: Number },
          amendInDepRate: { type: Boolean },
          changeInDepProspective: { type: Boolean },
          effectiveDate: { type: Date },

          // Ownership Details
          leaseType: { type: String },
          lessorName: { type: String },
          leasePeriod: { type: Number },
          leaseEndDate: { type: Date },
          leaseSplCondition: { type: String },
          leasePremium: { type: Number }, // For finance lease

          // Disposal Details
          disposalDetails: { type: String },
          residualValue: { type: Number },
          assetUsefulLife: { type: Number },

          // Charge Details
          chargeName: { type: String },
          chargeAmount: { type: Number },
          chargeCreation: { type: Date },
          chargeSatisfaction: { type: Date },
          loanAmount: { type: Number },

          // Assignment to Employee
          employeeList: [
               { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
          ],

          // Warranty Details
          warranty: { type: Boolean },
          warrantyStartDate: { type: Date },
          warrantyEndDate: { type: Date },
          warrantyContactPersonName: { type: String },
          warrantyContactPersonTelephone: { type: String },

          // Utilisation Alerts
          utilisationAlerts: { type: Boolean },

          // Insurance Details
          insurance: { type: Boolean },
          insurancePolicyNo: { type: String },
          insuranceStartDate: { type: Date },
          insuranceNature: { type: String },
          insuranceContactPersonName: { type: String },
          insuranceContactPersonTelephone: { type: String },

          // Repair & Maintenance Details
          maintenanceHistory: { type: String },
          currentStatus: {
               type: String,
               enum: ['ACTIVE', 'SPARE', 'HELD FOR SALE', 'RENOVATION'],
          },
          remark: { type: String },

          // Sale/Disposal Details
          saleAmount: { type: Number },
          saleDate: { type: Date },
          netBookValue: { type: Number },
     },
     { timestamps: true }
);

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
 */
