using Microsoft.AspNetCore.Mvc;
using EVChargingAPI.Services;
using EVChargingAPI.Models;
using MongoDB.Driver;

namespace EVChargingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly MongoDBService _mongoDBService;

        public DashboardController(MongoDBService mongoDBService)
        {
            _mongoDBService = mongoDBService;
        }

        // GET: api/dashboard/stats/{userId}
        [HttpGet("stats/{userId}")]
        public async Task<IActionResult> GetUserStats(string userId)
        {
            // Pending bookings count
            var pendingFilter = Builders<Booking>.Filter.Eq(b => b.UserId, userId) & 
                               Builders<Booking>.Filter.Eq(b => b.Status, "pending");
            var pendingCount = await _mongoDBService.Bookings.CountDocumentsAsync(pendingFilter);

            // Approved future bookings count
            var approvedFilter = Builders<Booking>.Filter.Eq(b => b.UserId, userId) & 
                                Builders<Booking>.Filter.Eq(b => b.Status, "confirmed") &
                                Builders<Booking>.Filter.Gt(b => b.StartTime, DateTime.UtcNow);
            var approvedCount = await _mongoDBService.Bookings.CountDocumentsAsync(approvedFilter);

            // Past bookings
            var pastFilter = Builders<Booking>.Filter.Eq(b => b.UserId, userId) & 
                            Builders<Booking>.Filter.Lt(b => b.StartTime, DateTime.UtcNow);
            var pastBookings = await _mongoDBService.Bookings.Find(pastFilter).ToListAsync();

            return Ok(new {
                pendingReservations = pendingCount,
                approvedReservations = approvedCount,
                pastBookings = pastBookings.Count
            });
        }
    }
}