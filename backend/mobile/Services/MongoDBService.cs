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

        // Collections for each model
        public IMongoCollection<User> Users => _database.GetCollection<User>("users");
        public IMongoCollection<Station> Stations => _database.GetCollection<Station>("stations");
        public IMongoCollection<Booking> Bookings => _database.GetCollection<Booking>("bookings");
    }

    public class MongoDBSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
    }
}