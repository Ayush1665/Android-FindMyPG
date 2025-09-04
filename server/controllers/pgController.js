const PG = require('../models/PG');
const redis = require("../config/redis")

// Get all PGs with filtering
const getAllPGs = async (req, res) => {
  try {
    const { location, minRent, maxRent, services, isAvailable } = req.query;
    let filter = {};
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (minRent || maxRent) {
      filter.rentNumeric = {};
      if (minRent) filter.rentNumeric.$gte = parseInt(minRent);
      if (maxRent) filter.rentNumeric.$lte = parseInt(maxRent);
    }
    
    if (services) {
      const servicesArray = services.split(',');
      filter.services = { $all: servicesArray };
    }
    
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }

    // ✅ Query is now direct & efficient (no map/filter after query)
    const pgs = await PG.find(filter).lean();
    
    res.json(pgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get single PG by ID
const getPGById = async (req, res) => {
  try {
    const pg = await PG.findOne({ id: parseInt(req.params.id) });
    if (!pg) {
      return res.status(404).json({ message: 'PG not found' });
    }
    res.json(pg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new PG
const createPG = async (req, res) => {
  try {
    // Get the highest ID to auto-increment
    const highestPG = await PG.findOne().sort('-id');
    const newId = highestPG ? highestPG.id + 1 : 1;
    
    const pg = new PG({
      ...req.body,
      rentNumeric: parseInt(rent.replace(/,/g, '')), // store numeric value here
      id: newId
    });
    
    const savedPG = await pg.save();
    res.status(201).json(savedPG);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update PG
const updatePG = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.rent) {
      updateData.rentNumeric = parseInt(updateData.rent.replace(/,/g, ''));
    }

    const pg = await PG.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!pg) {
      return res.status(404).json({ message: 'PG not found' });
    }

    res.json(pg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete PG
const deletePG = async (req, res) => {
  try {
    const pg = await PG.findOneAndDelete({ id: parseInt(req.params.id) });
    
    if (!pg) {
      return res.status(404).json({ message: 'PG not found' });
    }
    
    res.json({ message: 'PG deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search PGs by name or location
const searchPGs = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    const pgs = await PG.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { 'contact.manager': { $regex: q, $options: 'i' } }
      ]
    });
    
    res.json(pgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all locations (for filters)
const getLocations = async (req, res) => {
  try {
    const locations = await PG.distinct('location');
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all services (for filters)
const getServices = async (req, res) => {
  try {
    const services = await PG.distinct('services');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const clearCache = async () => {
  await redis.flushall(); // clears all cache (simple for now)
};

module.exports = {
  getAllPGs,
  getPGById,
  createPG,
  updatePG,
  deletePG,
  searchPGs,
  getLocations,
  getServices
};