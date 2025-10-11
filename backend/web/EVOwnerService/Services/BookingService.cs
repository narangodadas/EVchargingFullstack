using EVChargingStationWeb.Server.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EVChargingStationWeb.Server.Services
{
    public class BookingService
    {
        private readonly IMongoCollection<Booking> _collection;

        public BookingService(IMongoClient client, IOptions<MongoDbSettings> settings)
        {
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _collection = database.GetCollection<Booking>("bookings");
        }

        // Get all bookings
        public async Task<List<Booking>> GetAllAsync() =>
            await _collection.Find(_ => true).ToListAsync();

        // Get bookings by userId or stationId
        public async Task<List<Booking>> GetAsync(string userId = null, string stationId = null)
        {
            var filter = Builders<Booking>.Filter.Empty;
            if (!string.IsNullOrEmpty(userId))
                filter &= Builders<Booking>.Filter.Eq(b => b.UserId, userId);
            if (!string.IsNullOrEmpty(stationId))
                filter &= Builders<Booking>.Filter.Eq(b => b.StationId, stationId);

            return await _collection.Find(filter).ToListAsync();
        }

        // Get booking by Id
        public async Task<Booking> GetByIdAsync(string id) =>
            await _collection.Find(b => b.Id == id).FirstOrDefaultAsync();

        // Create a booking (validate <= 7 days)
        public async Task CreateAsync(Booking booking)
        {
            var now = DateTime.UtcNow;
            if (booking.StartTime < now || booking.StartTime > now.AddDays(7))
                throw new InvalidOperationException("Reservation must be within 7 days from now.");

            booking.BookingDate = now;
            booking.Status = "pending";
            booking.CreatedAt = now;
            booking.UpdatedAt = now;
            booking.Id = null;

            await _collection.InsertOneAsync(booking);
        }

        // Update booking (>=12 hours before)
        public async Task UpdateAsync(string id, Booking booking)
        {
            var existing = await GetByIdAsync(id);
            if (existing == null) throw new InvalidOperationException("Booking not found.");

            if ((existing.StartTime - DateTime.UtcNow).TotalHours < 12)
                throw new InvalidOperationException("Cannot update booking less than 12 hours before start time.");

            booking.Id = existing.Id; // preserve _id
            booking.UpdatedAt = DateTime.UtcNow;
            await _collection.ReplaceOneAsync(b => b.Id == id, booking);
        }

        // Cancel booking (>=12 hours before)
        public async Task CancelAsync(string id)
        {
            var booking = await GetByIdAsync(id);
            if (booking == null) throw new InvalidOperationException("Booking not found.");
            if ((booking.StartTime - DateTime.UtcNow).TotalHours < 12)
                throw new InvalidOperationException("Cannot cancel booking less than 12 hours before start time.");

            var update = Builders<Booking>.Update
                .Set(b => b.Status, "cancelled")
                .Set(b => b.UpdatedAt, DateTime.UtcNow);

            await _collection.UpdateOneAsync(b => b.Id == id, update);
        }
    }
}
