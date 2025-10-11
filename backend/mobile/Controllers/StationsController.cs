/*******************************************************
*file :         StationsController.cs
*Author:        IT22278180 - Narangoda D.A.S.
********************************************************/

using Microsoft.AspNetCore.Mvc;
using EVChargingAPI.Services;
using EVChargingAPI.Models;
using MongoDB.Driver;
using System.Text.Json;

namespace EVChargingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationsController : ControllerBase
    {
        private readonly MongoDBService _mongoDBService;
        private readonly ChargingStationService _chargingStationService;

        public StationsController(MongoDBService mongoDBService, ChargingStationService chargingStationService)
        {
            _mongoDBService = mongoDBService;
            _chargingStationService = chargingStationService;
        }

        // GET: api/stations (Compatibility endpoint)
        [HttpGet]
        public async Task<IActionResult> GetAllStations()
        {
            var stations = await _chargingStationService.GetAllAsync(StationStatus.Active);
            return Ok(stations);
        }

        // GET: api/stations/nearby?lat=6.9271&lng=79.8612 (Enhanced with new service)
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearbyStations(double lat, double lng, [FromQuery] double radius = 10)
        {
            var stations = await _chargingStationService.GetNearbyStationsAsync(lat, lng, radius);
            return Ok(stations);
        }

        // POST: api/stations (Enhanced with new service)
        [HttpPost]
        public async Task<IActionResult> CreateStation([FromBody] CreateStationRequest request)
        {
            try
            {
                var station = await _chargingStationService.CreateAsync(request);
                return Ok(new { message = "Station created successfully", stationId = station.Id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Additional endpoints from ChargingStationsController

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var station = await _chargingStationService.GetByIdAsync(id);
            return station != null ? Ok(station) : NotFound(new { message = "Station not found" });
        }

        [HttpGet("operator/{operatorId}")]
        public async Task<IActionResult> GetByOperator(string operatorId)
        {
            var stations = await _chargingStationService.GetByOperatorAsync(operatorId);
            return Ok(stations);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id)
        {
            try
            {
                // Read raw JSON to bypass model binding validation
                using var reader = new StreamReader(Request.Body);
                var json = await reader.ReadToEndAsync();
                
                if (string.IsNullOrEmpty(json))
                {
                    return BadRequest(new { message = "Request body is empty" });
                }

                // Parse JSON manually to avoid validation
                using var document = JsonDocument.Parse(json);
                var root = document.RootElement;

                // Create UpdateStationRequest manually
                var request = new UpdateStationRequest();

                // Only set properties that are present in the JSON (with null checks)
                if (root.TryGetProperty("name", out var nameElement) && nameElement.ValueKind != JsonValueKind.Null)
                {
                    request.Name = nameElement.GetString() ?? string.Empty;
                }

                if (root.TryGetProperty("totalSlots", out var slotsElement) && slotsElement.ValueKind != JsonValueKind.Null)
                {
                    request.TotalSlots = slotsElement.GetInt32();
                }

                if (root.TryGetProperty("type", out var typeElement) && typeElement.ValueKind != JsonValueKind.Null)
                {
                    request.Type = (StationType)typeElement.GetInt32();
                }

                if (root.TryGetProperty("status", out var statusElement) && statusElement.ValueKind != JsonValueKind.Null)
                {
                    request.Status = (StationStatus)statusElement.GetInt32();
                }

                if (root.TryGetProperty("operatorId", out var operatorElement) && operatorElement.ValueKind != JsonValueKind.Null)
                {
                    request.OperatorId = operatorElement.GetString() ?? string.Empty;
                }

                if (root.TryGetProperty("location", out var locationElement) && locationElement.ValueKind != JsonValueKind.Null)
                {
                    request.Location = new StationLocation();
                    
                    if (locationElement.TryGetProperty("address", out var addressElement) && addressElement.ValueKind != JsonValueKind.Null)
                        request.Location.Address = addressElement.GetString() ?? string.Empty;
                    
                    if (locationElement.TryGetProperty("city", out var cityElement) && cityElement.ValueKind != JsonValueKind.Null)
                        request.Location.City = cityElement.GetString() ?? string.Empty;
                    
                    if (locationElement.TryGetProperty("district", out var districtElement) && districtElement.ValueKind != JsonValueKind.Null)
                        request.Location.District = districtElement.GetString() ?? string.Empty;
                    
                    if (locationElement.TryGetProperty("latitude", out var latElement) && latElement.ValueKind != JsonValueKind.Null)
                        request.Location.Latitude = latElement.GetDouble();
                    
                    if (locationElement.TryGetProperty("longitude", out var lonElement) && lonElement.ValueKind != JsonValueKind.Null)
                        request.Location.Longitude = lonElement.GetDouble();
                }

                if (root.TryGetProperty("operatingHours", out var hoursElement) && hoursElement.ValueKind != JsonValueKind.Null)
                {
                    request.OperatingHours = new OperatingHours();
                    
                    if (hoursElement.TryGetProperty("openTime", out var openElement) && openElement.ValueKind != JsonValueKind.Null)
                    {
                        var openTimeString = openElement.GetString();
                        if (!string.IsNullOrEmpty(openTimeString))
                            request.OperatingHours.OpenTime = TimeSpan.Parse(openTimeString);
                    }
                    
                    if (hoursElement.TryGetProperty("closeTime", out var closeElement) && closeElement.ValueKind != JsonValueKind.Null)
                    {
                        var closeTimeString = closeElement.GetString();
                        if (!string.IsNullOrEmpty(closeTimeString))
                            request.OperatingHours.CloseTime = TimeSpan.Parse(closeTimeString);
                    }
                    
                    if (hoursElement.TryGetProperty("isOpen24Hours", out var is24Element) && is24Element.ValueKind != JsonValueKind.Null)
                        request.OperatingHours.IsOpen24Hours = is24Element.GetBoolean();
                }

                // Perform manual validation only for provided fields
                var validationErrors = new List<string>();

                // Validate Name if provided
                if (!string.IsNullOrEmpty(request.Name))
                {
                    if (request.Name.Length < 1 || request.Name.Length > 100)
                    {
                        validationErrors.Add("Name must be between 1 and 100 characters");
                    }
                }

                // Validate TotalSlots if provided
                if (request.TotalSlots.HasValue)
                {
                    if (request.TotalSlots.Value < 1 || request.TotalSlots.Value > 50)
                    {
                        validationErrors.Add("Total slots must be between 1 and 50");
                    }
                }

                // Return validation errors if any
                if (validationErrors.Any())
                {
                    return BadRequest(new { 
                        message = "Validation failed", 
                        errors = validationErrors 
                    });
                }

                await _chargingStationService.UpdateAsync(id, request);
                return Ok(new { message = "Station updated successfully" });
            }
            catch (JsonException ex)
            {
                return BadRequest(new { message = "Invalid JSON format", details = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Station not found" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "An error occurred", details = ex.Message });
            }
        }

        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> Activate(string id)
        {
            try
            {
                await _chargingStationService.ActivateAsync(id);
                return Ok(new { message = "Station activated successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Station not found" });
            }
        }

        [HttpPatch("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(string id)
        {
            try
            {
                await _chargingStationService.DeactivateAsync(id);
                return Ok(new { message = "Station deactivated successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Station not found" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/update-slots")]
        public async Task<IActionResult> UpdateAvailableSlots(string id)
        {
            try
            {
                await _chargingStationService.UpdateAvailableSlotsAsync(id);
                return Ok(new { message = "Available slots updated successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Station not found" });
            }
        }
    }
}