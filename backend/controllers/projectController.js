const mongoose = require('mongoose');
const Project = require('../models/projectModel');

// Create a new project
const createProject = async (req, res) => {
    try {
        const {
            ProjectName,
            FunctionalUnitMassTonnes,
            MetalType,
            ProcessingMode,
        } = req.body;

        // Validate required fields
        if (!ProjectName || ProjectName.trim() === "") {
            return res.status(400).json({ error: "ProjectName is required" });
        }

        if (FunctionalUnitMassTonnes === undefined || FunctionalUnitMassTonnes === null) {
            return res.status(400).json({ error: "FunctionalUnitMassTonnes is required" });
        }
        if (typeof FunctionalUnitMassTonnes !== "number" || FunctionalUnitMassTonnes <= 0) {
            return res.status(400).json({ error: "FunctionalUnitMassTonnes must be a positive number" });
        }

        if (!MetalType || MetalType.trim() === "") {
            return res.status(400).json({ error: "MetalType is required" });
        }

        if (!ProcessingMode || ProcessingMode.trim() === "") {
            return res.status(400).json({ error: "ProcessingMode is required" });
        }

        // Create project with sanitized data
        const projectData = {
            ProjectName: ProjectName.trim(),
            FunctionalUnitMassTonnes,
            MetalType: MetalType.trim(),
            ProcessingMode: ProcessingMode.trim(),
        };

        // Save project to DB
        const project = new Project(projectData);
        const createdProject = await project.save();

        // Return response with ProjectIdentifier
        res.status(201).json({
            message: "Project created successfully",
            project: {
                ...createdProject.toObject(),
                ProjectIdentifier: createdProject._id,
            },
        });
    } catch (error) {
        res.status(400).json({
            error: "Failed to create project",
            details: error.message,
        });
    }
};


// Retrieve all projects
const getAllProjects = async (req, res) => {
    try {
        console.log('Fetching all projects...'); // Debug log
        
        // Find all projects, sorted by creation date (newest first)
        const projects = await Project.find({})
            .sort({ CreatedAtUtc: -1 })
            .lean();

        console.log(`Found ${projects.length} projects`); // Debug log

        // Include ProjectIdentifier for each project
        const projectsWithIdentifier = projects.map(project => ({
            ...project,
            ProjectIdentifier: project._id,
        }));

        res.status(200).json({
            message: 'Projects retrieved successfully',
            projects: projectsWithIdentifier,
            count: projects.length,
        });
    } catch (error) {
        console.error('Error in getAllProjects:', error); // Debug log
        res.status(500).json({
            error: 'Failed to retrieve projects',
            details: error.message,
        });
    }
};

// Retrieve a project by ID
const getProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: 'Invalid Project ID' });
        }

        // Find project and populate StageReferences if available
        const project = await Project.findById(projectId).lean();
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Include ProjectIdentifier
        res.status(200).json({
            message: 'Project retrieved successfully',
            project: {
                ...project,
                ProjectIdentifier: project._id,
            },
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve project',
            details: error.message,
        });
    }
};

// Delete a project by ID (for testing purposes)
const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.projectId;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ error: 'Invalid Project ID' });
        }

        const deletedProject = await Project.findByIdAndDelete(projectId);
        if (!deletedProject) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json({
            message: 'Project deleted successfully',
            project: deletedProject,
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete project',
            details: error.message,
        });
    }
};

module.exports = { createProject, getAllProjects, getProject, deleteProject };