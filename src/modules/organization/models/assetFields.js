import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
     unique_item_id: String,
     rate_per_piece: Number,
});

const purchaseSchema = new mongoose.Schema({
     acquisition_date: Date,
     remark: String,
});

const capitalisationSchema = new mongoose.Schema({
     date: Date,
     remark: String,
});

const estimatedCompletionSchema = new mongoose.Schema({
     date: Date,
     remark: String,
});

const readyForUseSchema = new mongoose.Schema({
     date: Date,
     remark: String,
});

const putToUseSchema = new mongoose.Schema({
     date: Date,
     apply_as: String,
     remark: String,
});

const futureAdditionSchema = new mongoose.Schema({
     date: Date,
     apply_as: String,
     remark: String,
});

const leaseSchema = new mongoose.Schema({
     lease_type: String,
     lessor_name: String,
     lease_period: String,
     start_date: Date,
     end_date: Date,
     special_condition: String,
});

const ownershipSchema = new mongoose.Schema({
     ownership_type: String,
     lessor_name: String,
     install_hire_amount: Number,
     lease_period: Number,
     due_date: Date,
     legal_restrictions: String,
});

const warrantySchema = new mongoose.Schema({
     has_warranty: Boolean,
     warranty_start_date: Date,
     warranty_end_date: Date,
     nature_of_warranty: String,
     contact_person_name: String,
     utilization_alerts: String,
});

const insuranceSchema = new mongoose.Schema({
     has_insurance: Boolean,
     insurance_policy_no: String,
     insurance_table: String,
});

const disposalSchema = new mongoose.Schema({
     residual_value: Number,
     asset_useful_life: Number,
     useful_life_period: String,
});

const saleSchema = new mongoose.Schema({
     sale_amount: Number,
     sale_date: Date,
     net_book_value: Number,
});

const statusVerificationSchema = new mongoose.Schema({
     asset_status: String,
     physical_variation_period: String,
});

const remarkSchema = new mongoose.Schema({
     remark_period: String,
     remark_for_whom: String,
     remark_text: String,
});

const basicAssetDetailsSchema = new mongoose.Schema({
     name: String,
     serial_number: String,
     asset_id: String,
     description: String,
});

const assetMeasurementsQuantitySchema = new mongoose.Schema({
     unit_of_measurements: String,
     number_of_items: Number,
     separate_identification_no: Boolean,
     items: [itemSchema],
});

const assetComponentsSchema = new mongoose.Schema({
     has_components: Boolean,
     main_asset_id: String,
     class_of_asset: String,
     asset_group: String,
     asset_sub_group: String,
     industry_used: String,
     product_used: String,
});

const assignedToSchema = new mongoose.Schema({
     assigned_to: String,
});

const assetSchema = new mongoose.Schema({
     basic_asset_details: basicAssetDetailsSchema,
     asset_measurements_quantity: assetMeasurementsQuantitySchema,
     asset_components: assetComponentsSchema,
     asset_assigned_to: assignedToSchema,
     asset_acquisition: {
          purchase: purchaseSchema,
          capitalisation: capitalisationSchema,
          estimated_completion: estimatedCompletionSchema,
          ready_for_use: readyForUseSchema,
          put_to_use: putToUseSchema,
          future_addition: futureAdditionSchema,
          documents: [String],
     },
     cost_details: {
          acquisition_cost: Number,
          tax_reimbursed: Number,
          other_cost_reimbursed: Number,
          net_cost_of_acquisition: Number,
     },
     ownership_details: {
          lease: leaseSchema,
          ownership: ownershipSchema,
          documents: [String],
     },
     warranty_details: warrantySchema,
     insurance_details: insuranceSchema,
     sale_disposal_details: {
          disposal: disposalSchema,
          sale: saleSchema,
     },
     status_verification_details: statusVerificationSchema,
     remarks: remarkSchema,
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;

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


====
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
 */
