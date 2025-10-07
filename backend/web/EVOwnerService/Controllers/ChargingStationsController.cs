using EVChargingStationWeb.Server.Models;
using EVChargingStationWeb.Server.Services;
using EVChargingStationWeb.Server.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace EVChargingStationWeb.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChargingStationsController : ControllerBase
    {
        private readonly ChargingStationService _stationService;

        public ChargingStationsController(ChargingStationService stationService)
        {
            _stationService = stationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] StationStatus? status = null, [FromQuery] StationType? type = null)
        {
            var stations = await _stationService.GetAllAsync(status, type);
            return Ok(stations);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var station = await _stationService.GetByIdAsync(id);
            return station != null ? Ok(station) : NotFound();
        }

        [HttpGet("operator/{operatorId}")]
        public async Task<IActionResult> GetByOperator(string operatorId)
        {
            var stations = await _stationService.GetByOperatorAsync(operatorId);
            return Ok(stations);
        }

        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearby([FromQuery] double latitude, [FromQuery] double longitude, [FromQuery] double radius = 10)
        {
            var stations = await _stationService.GetNearbyStationsAsync(latitude, longitude, radius);
            return Ok(stations);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStationRequest request)
        {
            try
            {
                var station = await _stationService.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = station.Id }, station);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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

                // Only set properties that are present in the JSON
                if (root.TryGetProperty("name", out var nameElement))
                {
                    request.Name = nameElement.GetString();
                }

                if (root.TryGetProperty("totalSlots", out var slotsElement))
                {
                    request.TotalSlots = slotsElement.GetInt32();
                }

                if (root.TryGetProperty("type", out var typeElement))
                {
                    request.Type = (StationType)typeElement.GetInt32();
                }

                if (root.TryGetProperty("status", out var statusElement))
                {
                    request.Status = (StationStatus)statusElement.GetInt32();
                }

                if (root.TryGetProperty("operatorId", out var operatorElement))
                {
                    request.OperatorId = operatorElement.GetString();
                }

                if (root.TryGetProperty("location", out var locationElement))
                {
                    request.Location = new StationLocation();
                    
                    if (locationElement.TryGetProperty("address", out var addressElement))
                        request.Location.Address = addressElement.GetString();
                    
                    if (locationElement.TryGetProperty("city", out var cityElement))
                        request.Location.City = cityElement.GetString();
                    
                    if (locationElement.TryGetProperty("district", out var districtElement))
                        request.Location.District = districtElement.GetString();
                    
                    if (locationElement.TryGetProperty("latitude", out var latElement))
                        request.Location.Latitude = latElement.GetDouble();
                    
                    if (locationElement.TryGetProperty("longitude", out var lonElement))
                        request.Location.Longitude = lonElement.GetDouble();
                }

                if (root.TryGetProperty("operatingHours", out var hoursElement))
                {
                    request.OperatingHours = new OperatingHours();
                    
                    if (hoursElement.TryGetProperty("openTime", out var openElement))
                        request.OperatingHours.OpenTime = TimeSpan.Parse(openElement.GetString());
                    
                    if (hoursElement.TryGetProperty("closeTime", out var closeElement))
                        request.OperatingHours.CloseTime = TimeSpan.Parse(closeElement.GetString());
                    
                    if (hoursElement.TryGetProperty("isOpen24Hours", out var is24Element))
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

                await _stationService.UpdateAsync(id, request);
                return NoContent();
            }
            catch (JsonException ex)
            {
                return BadRequest(new { message = "Invalid JSON format", details = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
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
                await _stationService.ActivateAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPatch("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(string id)
        {
            try
            {
                await _stationService.DeactivateAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
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
                await _stationService.UpdateAvailableSlotsAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}