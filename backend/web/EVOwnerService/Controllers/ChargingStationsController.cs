using EVChargingStationWeb.Server.Models;
using EVChargingStationWeb.Server.Services;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> Update(string id, [FromBody] UpdateStationRequest request)
        {
            try
            {
                await _stationService.UpdateAsync(id, request);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
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