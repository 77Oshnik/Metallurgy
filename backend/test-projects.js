const mongoose = require('mongoose');
require('dotenv').config();

const Project = require('./models/projectModel');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lca_platform');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const createSampleProjects = async () => {
    try {
        // Clear existing projects (optional)
        await Project.deleteMany({});
        console.log('Cleared existing projects');

        // Create sample projects
        const sampleProjects = [
            {
                ProjectName: 'Aluminum Recycling Plant',
                FunctionalUnitMassTonnes: 1000,
                MetalType: 'Aluminium',
                ProcessingMode: 'Circular'
            },
            {
                ProjectName: 'Copper Mining Operation',
                FunctionalUnitMassTonnes: 500,
                MetalType: 'Copper',
                ProcessingMode: 'Linear'
            },
            {
                ProjectName: 'Critical Minerals Extraction',
                FunctionalUnitMassTonnes: 100,
                MetalType: 'CriticalMinerals',
                ProcessingMode: 'Circular'
            },
            {
                ProjectName: 'Sustainable Aluminum Production',
                FunctionalUnitMassTonnes: 750,
                MetalType: 'Aluminium',
                ProcessingMode: 'Circular'
            },
            {
                ProjectName: 'Copper Smelting Facility',
                FunctionalUnitMassTonnes: 300,
                MetalType: 'Copper',
                ProcessingMode: 'Linear'
            }
        ];

        const createdProjects = await Project.insertMany(sampleProjects);
        console.log(`Created ${createdProjects.length} sample projects:`);
        createdProjects.forEach(project => {
            console.log(`- ${project.ProjectName} (${project.MetalType}, ${project.ProcessingMode})`);
        });

    } catch (error) {
        console.error('Error creating sample projects:', error);
    } finally {
        mongoose.connection.close();
    }
};

const main = async () => {
    await connectDB();
    await createSampleProjects();
};

main();