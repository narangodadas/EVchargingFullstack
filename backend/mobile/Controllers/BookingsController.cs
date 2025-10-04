using Microsoft.AspNetCore.Mvc;
using EVChargingAPI.Services;
using EVChargingAPI.Models;
using MongoDB.Driver;

namespace EVChargingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly MongoDBService _mongoDBService;

        public BookingsController(MongoDBService mongoDBService)
        {
            _mongoDBService = mongoDBService;
        }

        // GET: api/bookings/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserBookings(string userId)
        {
            var filter = Builders<Booking>.Filter.Eq(b => b.UserId, userId);
            var bookings = await _mongoDBService.Bookings.Find(filter).ToListAsync();
            return Ok(bookings);
        }

        // POST: api/bookings
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] Booking booking)
        {
            // Check if booking is within 7 days
            if (booking.StartTime > DateTime.UtcNow.AddDays(7))
            {
                return BadRequest(new { message = "Booking can only be made within 7 days" });
            }

            booking.CreatedAt = DateTime.UtcNow;
            booking.UpdatedAt = DateTime.UtcNow;
            booking.Status = "pending";
            
            await _mongoDBService.Bookings.InsertOneAsync(booking);
            return Ok(new { message = "Booking created successfully", bookingId = booking.Id });
        }

        // PUT: api/bookings/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBooking(string id, [FromBody] Booking updatedBooking)
        {
            var existingBooking = await _mongoDBService.Bookings.Find(b => b.Id == id).FirstOrDefaultAsync();
            if (existingBooking == null)
            {
                return NotFound(new { message = "Booking not found" });
            }

            // Check 12-hour rule
            if (existingBooking.StartTime <= DateTime.UtcNow.AddHours(12))
            {
                return BadRequest(new { message = "Cannot update booking within 12 hours of start time" });
            }

            updatedBooking.UpdatedAt = DateTime.UtcNow;
            await _mongoDBService.Bookings.ReplaceOneAsync(b => b.Id == id, updatedBooking);
            return Ok(new { message = "Booking updated successfully" });
        }

        [HttpPut("{id}/approve")]
public async Task<IActionResult> ApproveBooking(string id)
{
    var filter = Builders<Booking>.Filter.Eq(b => b.Id, id);
    var booking = await _mongoDBService.Bookings.Find(filter).FirstOrDefaultAsync();
    
    if (booking == null)
    {
        return NotFound(new { message = "Booking not found" });
    }

    var update = Builders<Booking>.Update.Set(b => b.Status, "confirmed");
    await _mongoDBService.Bookings.UpdateOneAsync(filter, update);
    
    return Ok(new { message = "Booking approved successfully" });
}

// PUT: api/bookings/{id}/complete (Station Operator)
[HttpPut("{id}/complete")]
public async Task<IActionResult> CompleteBooking(string id)
{
    var filter = Builders<Booking>.Filter.Eq(b => b.Id, id);
    var booking = await _mongoDBService.Bookings.Find(filter).FirstOrDefaultAsync();
    
    if (booking == null)
    {
        return NotFound(new { message = "Booking not found" });
    }

    var update = Builders<Booking>.Update.Set(b => b.Status, "completed");
    await _mongoDBService.Bookings.UpdateOneAsync(filter, update);
    
    return Ok(new { message = "Booking completed successfully" });
}

        // DELETE: api/bookings/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(string id)
        {
            var existingBooking = await _mongoDBService.Bookings.Find(b => b.Id == id).FirstOrDefaultAsync();
            if (existingBooking == null)
            {
                return NotFound(new { message = "Booking not found" });
            }

            // Check 12-hour rule
            if (existingBooking.StartTime <= DateTime.UtcNow.AddHours(12))
            {
                return BadRequest(new { message = "Cannot cancel booking within 12 hours of start time" });
            }

            await _mongoDBService.Bookings.DeleteOneAsync(b => b.Id == id);
            return Ok(new { message = "Booking cancelled successfully" });
        }

        // GET: api/bookings/{id}/qrcode
        [HttpGet("{id}/qrcode")]
        public async Task<IActionResult> GenerateQRCode(string id)
        {
            var booking = await _mongoDBService.Bookings.Find(b => b.Id == id).FirstOrDefaultAsync();
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found" });
            }

            // Simple QR code data (in real app, use a QR code library)
            var qrData = $"EVBooking:{id}:{booking.UserId}:{booking.StationId}";
            booking.QRCodeData = qrData;
            await _mongoDBService.Bookings.ReplaceOneAsync(b => b.Id == id, booking);

            return Ok(new { qrCodeData = qrData });
        }
    }
}