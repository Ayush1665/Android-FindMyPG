const redis = require("../config/redis");

const cache = (keyPrefix) => async (req, res, next) => {
  try {
    const key = keyPrefix + JSON.stringify(req.query || req.params);

    const cached = await redis.get(key);
    if (cached) {
      console.log("📦 Cache hit");
      return res.json(JSON.parse(cached));
    }

    // Override res.json to store data in cache
    res.sendResponse = res.json;
    res.json = (body) => {
      redis.setex(key, 60, JSON.stringify(body)); // cache 60 sec
      res.sendResponse(body);
    };

    next();
  } catch (err) {
    console.error("Cache error:", err);
    next();
  }
};

module.exports = cache;
