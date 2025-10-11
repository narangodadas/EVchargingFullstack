/*******************************************************
*file :         Services/MongoDBService.cs
*Author:        IT22278180 - Narangoda D.A.S. 
********************************************************/

using Microsoft.Extensions.Options;
using MongoDB.Driver;
using EVChargingAPI.Models;

namespace EVChargingAPI.Services
{
    public class MongoDBService
    {
        private readonly IMongoDatabase _database;

        public MongoDBService(IOptions<MongoDBSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            _database = client.GetDatabase(settings.Value.DatabaseName);
        }

        // Updated Collections - using ChargingStations instead of Stations
        public IMongoCollection<User> Users => _database.GetCollection<User>("users");
        public IMongoCollection<ChargingStation> ChargingStations => _database.GetCollection<ChargingStation>("chargingStations");
        public IMongoCollection<Booking> Bookings => _database.GetCollection<Booking>("bookings");
    }

    public class MongoDBSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
    }
}