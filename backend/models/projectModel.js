const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    ProjectName: {
        type: String,
        required: true,
    },
    FunctionalUnitMassTonnes: {
        type: Number,
        default: 1.0,
    },
}, {
    timestamps: { createdAt: 'CreatedAtUtc', updatedAt: 'UpdatedAtUtc' }
});

// Using _id as ProjectIdentifier internally
projectSchema.virtual('ProjectIdentifier').get(function() {
    return this._id;
});

module.exports = mongoose.model('Project', projectSchema);
