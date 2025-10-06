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
        private readonly IMongoCollection<Booking> _bookings;
        // If you have Stations collection, consider injecting StationService to check capacity.

        public BookingService(IMongoClient client, IOptions<MongoDbSettings> settings)
        {
            var db = client.GetDatabase(settings.Value.DatabaseName);
            _bookings = db.GetCollection<Booking>("bookings");
            // Create indexes optionally on startup (if not already created)
            var indexKeys = Builders<Booking>.IndexKeys
                .Ascending(b => b.StationId)
                .Ascending(b => b.ReservationDate)
                .Ascending(b => b.Status);
            _bookings.Indexes.CreateOne(new CreateIndexModel<Booking>(indexKeys));
        }

        public async Task<List<Booking>> GetAsync(string stationId = null, string userId = null)
        {
            var filter = Builders<Booking>.Filter.Empty;

            if (!string.IsNullOrWhiteSpace(stationId))
                filter &= Builders<Booking>.Filter.Eq(b => b.StationId, stationId);
            if (!string.IsNullOrWhiteSpace(userId))
                filter &= Builders<Booking>.Filter.Eq(b => b.UserId, userId);

            return await _bookings.Find(filter).ToListAsync();
        }

        public async Task<Booking> GetByIdAsync(string id) =>
            await _bookings.Find(b => b.Id == id).FirstOrDefaultAsync();

        public async Task<Booking> CreateAsync(Booking booking)
        {
            var now = DateTime.UtcNow;

            if (booking == null) throw new ArgumentNullException(nameof(booking));
            if (booking.ReservationDate < now || booking.ReservationDate > now.AddDays(7))
                throw new ArgumentException("Reservation date must be within next 7 days from now.");

            // Optional: check station is active / owner is active (inject and check other collections)
            // Optional: check slot availability. Basic check example below (assumes one booking per exact datetime slot)
            var conflictFilter = Builders<Booking>.Filter.Eq(b => b.StationId, booking.StationId)
                                 & Builders<Booking>.Filter.Eq(b => b.ReservationDate, booking.ReservationDate)
                                 & Builders<Booking>.Filter.Eq(b => b.Status, BookingStatus.Active);
            var existingCount = await _bookings.CountDocumentsAsync(conflictFilter);
            // If you have station.TotalSlots, replace this with capacity comparison:
            // if (existingCount >= station.TotalSlots) throw new InvalidOperationException("No slots available.");

            if (existingCount > 0)
                throw new InvalidOperationException("Selected timeslot is already fully booked.");

            await _bookings.InsertOneAsync(booking);
            return booking;
        }

        public async Task UpdateAsync(string id, Booking updated)
        {
            var existing = await GetByIdAsync(id);
            if (existing == null) throw new KeyNotFoundException("Booking not found.");

            var now = DateTime.UtcNow;
            // Must check current reservation time (existing.ReservationDate), not updated.ReservationDate
            if ((existing.ReservationDate - now).TotalHours < 12)
                throw new InvalidOperationException("Cannot update booking within 12 hours of the reservation.");

            // Validate new reservation date is still within 7 days (if changed)
            if (updated.ReservationDate < now || updated.ReservationDate > now.AddDays(7))
                throw new ArgumentException("Reservation date must be within next 7 days from now.");

            // Optional: re-check conflicts for the new datetime
            var conflictFilter = Builders<Booking>.Filter.Eq(b => b.StationId, updated.StationId)
                                 & Builders<Booking>.Filter.Eq(b => b.ReservationDate, updated.ReservationDate)
                                 & Builders<Booking>.Filter.Eq(b => b.Status, BookingStatus.Active)
                                 & Builders<Booking>.Filter.Ne(b => b.Id, id);
            var existingCount = await _bookings.CountDocumentsAsync(conflictFilter);
            if (existingCount > 0)
                throw new InvalidOperationException("Selected timeslot is already fully booked.");

            // Keep immutable fields such as Id and CreatedAt; update allowed fields:
            var update = Builders<Booking>.Update
                .Set(b => b.StationId, updated.StationId)
                .Set(b => b.UserId, updated.UserId)
                .Set(b => b.ReservationDate, updated.ReservationDate)
                .Set(b => b.Status, updated.Status);

            await _bookings.UpdateOneAsync(b => b.Id == id, update);
        }

        public async Task CancelAsync(string id)
        {
            var existing = await GetByIdAsync(id);
            if (existing == null) throw new KeyNotFoundException("Booking not found.");

            var now = DateTime.UtcNow;
            if ((existing.ReservationDate - now).TotalHours < 12)
                throw new InvalidOperationException("Cannot cancel booking within 12 hours of the reservation.");

            var update = Builders<Booking>.Update.Set(b => b.Status, BookingStatus.Cancelled);
            await _bookings.UpdateOneAsync(b => b.Id == id, update);
        }
    }
}
