const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    ProjectName: {
       type: String,
        required: [true, 'Project name is required'],
        trim: true,
        minlength: [1, 'Project name must be at least 1 character'],
        maxlength: [20, 'Project name cannot exceed 100 characters'],
    },
    FunctionalUnitMassTonnes: {
        type: Number,
        required: [true, 'Functional unit mass in tonnes is required'],
        min: [0.0001, 'Functional unit mass must be greater than 0'],
        default: 1.0,
    },
    MetalType: {
        type: String,
        required: [true, 'Metal type is required'],
        enum: {
            values: ['Aluminium', 'Copper', 'CriticalMinerals'],
            message: 'Metal type must be Aluminium, Copper, or CriticalMinerals',
        },
    },
    ProcessingMode: {
        type: String,
        required: [true, 'Processing mode is required'],
        enum: {
            values: ['Linear', 'Circular'],
            message: 'Processing mode must be Linear or Circular',
        },
        default: 'Circular',
    }
}, {
    timestamps: { createdAt: 'CreatedAtUtc', updatedAt: 'UpdatedAtUtc' }
});

// Using _id as ProjectIdentifier internally
projectSchema.virtual('ProjectIdentifier').get(function() {
    return this._id;
});

module.exports = mongoose.model('Project', projectSchema);
