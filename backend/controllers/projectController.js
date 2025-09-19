const Project = require('../models/projectModel');

const createProject = async (req, res) => {
    try {
        const { ProjectName, FunctionalUnitMassTonnes } = req.body;
        const project = new Project({
            ProjectName,
            FunctionalUnitMassTonnes,
        });
        const createdProject = await project.save();
        // The ProjectIdentifier is the mongo _id
        res.status(201).json({ ...createdProject.toObject(), ProjectIdentifier: createdProject._id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = { createProject };
