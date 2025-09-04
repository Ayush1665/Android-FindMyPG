const express = require('express');
const router = express.Router();
const {
  getAllPGs,
  getPGById,
  createPG,
  updatePG,
  deletePG,
  searchPGs,
  getLocations,
  getServices
} = require('../controllers/pgController');
const { validatePG } = require('../middleware/validation');
const cache=require("../middleware/cache")

// GET /api/pgs - Get all PGs with optional filtering
router.get('/', cache("pgs:"),getAllPGs);

// GET /api/pgs/search?q=query - Search PGs
router.get('/search',cache("pgs-search:"), searchPGs);

// GET /api/pgs/locations - Get all locations
router.get('/locations', cache("pgs-locations:"), getLocations);

// GET /api/pgs/services - Get all services
router.get('/services', cache("pgs-services:"), getServices);

// GET /api/pgs/:id - Get single PG by ID
router.get('/:id',cache("pgs:"),  getPGById);

// POST /api/pgs - Create new PG
router.post('/', validatePG, createPG);

// PUT /api/pgs/:id - Update PG
router.put('/:id', validatePG, updatePG);

// DELETE /api/pgs/:id - Delete PG
router.delete('/:id', deletePG);

module.exports = router;