using EVChargingStationWeb.Server.Models;
using EVChargingStationWeb.Server.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace EVChargingStationWeb.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly BookingService _svc;
        public BookingsController(BookingService svc) => _svc = svc;

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] string stationId = null, [FromQuery] string userId = null)
        {
            var list = await _svc.GetAsync(stationId, userId);
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var b = await _svc.GetByIdAsync(id);
            return b == null ? NotFound() : Ok(b);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Booking booking)
        {
            try
            {
                var created = await _svc.CreateAsync(booking);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Booking booking)
        {
            try
            {
                await _svc.UpdateAsync(id, booking);
                return NoContent();
            }
            catch (KeyNotFoundException) { return NotFound(); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> Cancel(string id)
        {
            try
            {
                await _svc.CancelAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException) { return NotFound(); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }
    }
}
