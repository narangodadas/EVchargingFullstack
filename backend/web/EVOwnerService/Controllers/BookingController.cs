using EVChargingStationWeb.Server.Models;
using EVChargingStationWeb.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace EVChargingStationWeb.Server.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    [Authorize(Roles = "Backoffice,StationOperator")]
    public class BookingsController : ControllerBase
    {
        private readonly BookingService _service;
        public BookingsController(BookingService service) => _service = service;

        // POST: create booking
        [HttpPost]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> Create([FromBody] Booking booking)
        {
            try
            {
                await _service.CreateAsync(booking);
                return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: all or filter by userId/stationId
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string userId = null, [FromQuery] string stationId = null)
        {
            var bookings = await _service.GetAsync(userId, stationId);
            return Ok(bookings);
        }

        // GET by Id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var booking = await _service.GetByIdAsync(id);
            return booking != null ? Ok(booking) : NotFound();
        }

        // PUT: update booking
        [HttpPut("{id}")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> Update(string id, [FromBody] Booking booking)
        {
            try
            {
                await _service.UpdateAsync(id, booking);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PATCH: cancel booking
        [HttpPatch("{id}/cancel")]
        [Authorize(Roles = "Backoffice")]
        public async Task<IActionResult> Cancel(string id)
        {
            try
            {
                await _service.CancelAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
