using Microsoft.AspNetCore.Mvc;
using EVChargingAPI.Services;
using EVChargingAPI.Models;
using MongoDB.Driver;

namespace EVChargingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationsController : ControllerBase
    {
        private readonly MongoDBService _mongoDBService;

        public StationsController(MongoDBService mongoDBService)
        {
            _mongoDBService = mongoDBService;
        }

        // GET: api/stations
        [HttpGet]
        public async Task<IActionResult> GetAllStations()
        {
            var stations = await _mongoDBService.Stations.Find(_ => true).ToListAsync();
            return Ok(stations);
        }

        // GET: api/stations/nearby?lat=6.9271&lng=79.8612
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearbyStations(double lat, double lng)
        {
            var filter = Builders<Station>.Filter.Eq(s => s.IsActive, true);
            var stations = await _mongoDBService.Stations.Find(filter).ToListAsync();
            return Ok(stations);
        }

        // POST: api/stations
        [HttpPost]
        public async Task<IActionResult> CreateStation([FromBody] Station station)
        {
            station.CreatedAt = DateTime.UtcNow;
            await _mongoDBService.Stations.InsertOneAsync(station);
            return Ok(new { message = "Station created successfully" });
        }
    }
}