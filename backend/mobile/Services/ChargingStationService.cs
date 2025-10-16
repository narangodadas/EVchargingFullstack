/*******************************************************
*file :         Services/ChargingStationService.cs
*Author:        IT22278180 - Narangoda D.A.S.
********************************************************/

using EVChargingAPI.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace EVChargingAPI.Services
{
    public class ChargingStationService
    {
        private readonly IMongoCollection<ChargingStation> _stations;
        private readonly IMongoCollection<Booking> _bookings;

        public ChargingStationService(IMongoClient client, IOptions<MongoDBSettings> settings)
        {
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _stations = database.GetCollection<ChargingStation>("chargingStations");
            _bookings = database.GetCollection<Booking>("bookings");

            // Create indexes
            var indexKeys = Builders<ChargingStation>.IndexKeys
                .Ascending(s => s.Status)
                .Ascending(s => s.Type)
                .Ascending(s => s.OperatorId);
            _stations.Indexes.CreateOne(new CreateIndexModel<ChargingStation>(indexKeys));
        }

        public async Task<List<ChargingStation>> GetAllAsync(StationStatus? status = null, StationType? type = null)
        {
            var filter = Builders<ChargingStation>.Filter.Empty;

            if (status.HasValue)
                filter &= Builders<ChargingStation>.Filter.Eq(s => s.Status, status.Value);
            
            if (type.HasValue)
                filter &= Builders<ChargingStation>.Filter.Eq(s => s.Type, type.Value);

            return await _stations.Find(filter).ToListAsync();
        }

        public async Task<ChargingStation> GetByIdAsync(string id)
        {
            return await _stations.Find(s => s.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<ChargingStation>> GetByOperatorAsync(string operatorId)
        {
            return await _stations.Find(s => s.OperatorId == operatorId).ToListAsync();
        }

        public async Task<ChargingStation> CreateAsync(CreateStationRequest request)
        {
            var station = new ChargingStation
            {
                Name = request.Name,
                Location = request.Location,
                Type = request.Type,
                TotalSlots = request.TotalSlots,
                AvailableSlots = request.TotalSlots, // Initially all slots are available
                OperatingHours = request.OperatingHours,
                OperatorId = request.OperatorId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true,
                Rating = 4.5,
                ReviewsCount = 0,
                PricePerHour = "₹20/hr"
            };

            await _stations.InsertOneAsync(station);
            return station;
        }

        public async Task UpdateAsync(string id, UpdateStationRequest request)
        {
            var filter = Builders<ChargingStation>.Filter.Eq(s => s.Id, id);
            var updateBuilder = Builders<ChargingStation>.Update;
            var updates = new List<UpdateDefinition<ChargingStation>>();

            if (!string.IsNullOrEmpty(request.Name))
                updates.Add(updateBuilder.Set(s => s.Name, request.Name));
            
            if (request.Location != null)
                updates.Add(updateBuilder.Set(s => s.Location, request.Location));
            
            if (request.Type.HasValue)
                updates.Add(updateBuilder.Set(s => s.Type, request.Type.Value));
            
            if (request.TotalSlots.HasValue)
            {
                updates.Add(updateBuilder.Set(s => s.TotalSlots, request.TotalSlots.Value));
                // Recalculate available slots based on active bookings
                await UpdateAvailableSlotsAsync(id);
            }
            
            if (request.OperatingHours != null)
                updates.Add(updateBuilder.Set(s => s.OperatingHours, request.OperatingHours));
            
            if (request.Status.HasValue)
            {
                updates.Add(updateBuilder.Set(s => s.Status, request.Status.Value));
                updates.Add(updateBuilder.Set(s => s.IsActive, request.Status.Value == StationStatus.Active));
            }
            
            if (!string.IsNullOrEmpty(request.OperatorId))
                updates.Add(updateBuilder.Set(s => s.OperatorId, request.OperatorId));

            updates.Add(updateBuilder.Set(s => s.UpdatedAt, DateTime.UtcNow));

            if (updates.Any())
            {
                var combinedUpdate = updateBuilder.Combine(updates);
                var result = await _stations.UpdateOneAsync(filter, combinedUpdate);
                
                if (result.MatchedCount == 0)
                    throw new KeyNotFoundException("Charging station not found");
            }
        }

        public async Task ActivateAsync(string id)
        {
            var result = await _stations.UpdateOneAsync(
                s => s.Id == id,
                Builders<ChargingStation>.Update
                    .Set(s => s.Status, StationStatus.Active)
                    .Set(s => s.IsActive, true)
                    .Set(s => s.UpdatedAt, DateTime.UtcNow));
            
            if (result.MatchedCount == 0)
                throw new KeyNotFoundException("Charging station not found");
        }

        public async Task DeactivateAsync(string id)
        {
            // Check if there are active bookings for this station
            var activeBookingsCount = await GetActiveBookingsCountAsync(id);
            if (activeBookingsCount > 0)
            {
                throw new InvalidOperationException($"Cannot deactivate station with {activeBookingsCount} active bookings");
            }

            var result = await _stations.UpdateOneAsync(
                s => s.Id == id,
                Builders<ChargingStation>.Update
                    .Set(s => s.Status, StationStatus.Inactive)
                    .Set(s => s.IsActive, false)
                    .Set(s => s.UpdatedAt, DateTime.UtcNow));
            
            if (result.MatchedCount == 0)
                throw new KeyNotFoundException("Charging station not found");
        }

        public async Task UpdateAvailableSlotsAsync(string stationId)
        {
            var station = await GetByIdAsync(stationId);
            if (station == null) return;

            var activeBookingsCount = await GetActiveBookingsCountAsync(stationId);
            var availableSlots = Math.Max(0, station.TotalSlots - activeBookingsCount);

            await _stations.UpdateOneAsync(
                s => s.Id == stationId,
                Builders<ChargingStation>.Update
                    .Set(s => s.AvailableSlots, availableSlots)
                    .Set(s => s.UpdatedAt, DateTime.UtcNow));
        }

        public async Task<List<ChargingStation>> GetNearbyStationsAsync(double latitude, double longitude, double radiusKm = 10)
        {
            var allStations = await _stations.Find(s => s.Status == StationStatus.Active).ToListAsync();
            
            var nearbyStations = allStations.Where(station =>
            {
                var distance = CalculateDistance(latitude, longitude, 
                    station.Location.Latitude, station.Location.Longitude);
                return distance <= radiusKm;
            }).ToList();

            return nearbyStations;
        }

        private async Task<int> GetActiveBookingsCountAsync(string stationId)
        {
            var now = DateTime.UtcNow;
            var activeStatuses = new[] { "confirmed", "in-progress" };

            var count = await _bookings.CountDocumentsAsync(b =>
                b.StationId == stationId &&
                activeStatuses.Contains(b.Status) &&
                b.StartTime <= now &&
                b.EndTime >= now);

            return (int)count;
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth's radius in kilometers
            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        private double ToRadians(double degrees)
        {
            return degrees * (Math.PI / 180);
        }
    }
}