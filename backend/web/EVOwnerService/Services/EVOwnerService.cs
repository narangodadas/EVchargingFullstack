namespace EVChargingStationWeb.Server.Services
{
    using MongoDB.Driver;
    using Microsoft.Extensions.Configuration;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using EVChargingStationWeb.Server.Models; // Import model

    public class EVOwnerService
    {
        private readonly IMongoCollection<EVOwner> _collection;

        public EVOwnerService(IMongoClient client, IConfiguration config)
        {
            var db = client.GetDatabase(config["MongoDb:DatabaseName"]);
            _collection = db.GetCollection<EVOwner>("evOwners");
        }

        public async Task<List<EVOwner>> GetAllAsync() =>
            await _collection.Find(_ => true).ToListAsync();

        public async Task<EVOwner> GetByNicAsync(string nic) =>
            await _collection.Find(o => o.NIC == nic).FirstOrDefaultAsync();

        public async Task CreateAsync(EVOwner owner)
        {
            var exists = await _collection.Find(o => o.NIC == owner.NIC).AnyAsync();
            if (exists) throw new InvalidOperationException("NIC already exists");
            await _collection.InsertOneAsync(owner);
        }

        public async Task UpdateAsync(string nic, EVOwner owner)
        {
            var filter = Builders<EVOwner>.Filter.Eq(o => o.NIC, nic);

            var update = Builders<EVOwner>.Update
                .Set(o => o.FullName, owner.FullName)
                .Set(o => o.Email, owner.Email)
                .Set(o => o.Phone, owner.Phone)
                .Set(o => o.IsActive, owner.IsActive);

            await _collection.UpdateOneAsync(filter, update);
        }

        public async Task ActivateAsync(string nic) =>
            await _collection.UpdateOneAsync(o => o.NIC == nic,
                Builders<EVOwner>.Update.Set(x => x.IsActive, true));

        public async Task DeactivateAsync(string nic) =>
            await _collection.UpdateOneAsync(o => o.NIC == nic,
                Builders<EVOwner>.Update.Set(x => x.IsActive, false));

        public async Task DeleteAsync(string nic) =>
            await _collection.DeleteOneAsync(o => o.NIC == nic);
    }
}
