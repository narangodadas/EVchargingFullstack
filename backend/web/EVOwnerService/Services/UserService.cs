using EVChargingStationWeb.Server.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System.Security.Cryptography;
using System.Text;

namespace EVChargingStationWeb.Server.Services
{
    public class UserService
    {
        private readonly IMongoCollection<ApplicationUser> _users;

        public UserService(IMongoClient client, IOptions<MongoDbSettings> settings)
        {
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _users = database.GetCollection<ApplicationUser>("applicationUsers");

            // Create indexes
            var indexKeys = Builders<ApplicationUser>.IndexKeys
                .Ascending(u => u.Username)
                .Ascending(u => u.Email);
            _users.Indexes.CreateOne(new CreateIndexModel<ApplicationUser>(indexKeys));
        }

        public async Task<List<ApplicationUser>> GetAllAsync()
        {
            return await _users.Find(_ => true)
                .Project(u => new ApplicationUser
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    LastLogin = u.LastLogin
                    // Exclude PasswordHash for security
                })
                .ToListAsync();
        }

        public async Task<ApplicationUser> GetByIdAsync(string id)
        {
            return await _users.Find(u => u.Id == id)
                .Project(u => new ApplicationUser
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    LastLogin = u.LastLogin
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ApplicationUser> GetByUsernameAsync(string username)
        {
            return await _users.Find(u => u.Username == username).FirstOrDefaultAsync();
        }

        public async Task<ApplicationUser> CreateAsync(CreateUserRequest request)
        {
            // Check if username or email already exists
            var existingUser = await _users.Find(u => u.Username == request.Username || u.Email == request.Email)
                .FirstOrDefaultAsync();
            
            if (existingUser != null)
            {
                throw new InvalidOperationException("Username or email already exists");
            }

            var user = new ApplicationUser
            {
                Username = request.Username,
                Email = request.Email,
                FullName = request.FullName,
                Role = request.Role,
                PasswordHash = HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow
            };

            await _users.InsertOneAsync(user);
            return await GetByIdAsync(user.Id);
        }

        public async Task UpdateAsync(string id, UpdateUserRequest request)
        {
            var filter = Builders<ApplicationUser>.Filter.Eq(u => u.Id, id);
            var updateBuilder = Builders<ApplicationUser>.Update;
            var updates = new List<UpdateDefinition<ApplicationUser>>();

            if (!string.IsNullOrEmpty(request.Email))
                updates.Add(updateBuilder.Set(u => u.Email, request.Email));
            
            if (!string.IsNullOrEmpty(request.FullName))
                updates.Add(updateBuilder.Set(u => u.FullName, request.FullName));
            
            if (request.Role.HasValue)
                updates.Add(updateBuilder.Set(u => u.Role, request.Role.Value));
            
            if (request.IsActive.HasValue)
                updates.Add(updateBuilder.Set(u => u.IsActive, request.IsActive.Value));

            if (updates.Any())
            {
                var combinedUpdate = updateBuilder.Combine(updates);
                var result = await _users.UpdateOneAsync(filter, combinedUpdate);
                
                if (result.MatchedCount == 0)
                    throw new KeyNotFoundException("User not found");
            }
        }

        public async Task ActivateAsync(string id)
        {
            var result = await _users.UpdateOneAsync(
                u => u.Id == id,
                Builders<ApplicationUser>.Update.Set(u => u.IsActive, true));
            
            if (result.MatchedCount == 0)
                throw new KeyNotFoundException("User not found");
        }

        public async Task DeactivateAsync(string id)
        {
            var result = await _users.UpdateOneAsync(
                u => u.Id == id,
                Builders<ApplicationUser>.Update.Set(u => u.IsActive, false));
            
            if (result.MatchedCount == 0)
                throw new KeyNotFoundException("User not found");
        }

        public async Task DeleteAsync(string id)
        {
            var result = await _users.DeleteOneAsync(u => u.Id == id);
            if (result.DeletedCount == 0)
                throw new KeyNotFoundException("User not found");
        }

        public async Task<ApplicationUser> AuthenticateAsync(LoginRequest request)
        {
            var user = await _users.Find(u => u.Username == request.Username).FirstOrDefaultAsync();
            
            if (user == null || !VerifyPassword(request.Password, user.PasswordHash) || !user.IsActive)
                return null;

            // Update last login
            await _users.UpdateOneAsync(
                u => u.Id == user.Id,
                Builders<ApplicationUser>.Update.Set(u => u.LastLogin, DateTime.UtcNow));

            return await GetByIdAsync(user.Id);
        }

        public async Task<List<ApplicationUser>> GetStationOperatorsAsync()
        {
            return await _users.Find(u => u.Role == UserRole.StationOperator && u.IsActive)
                .Project(u => new ApplicationUser
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FullName,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "YourSaltKey"));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput == hash;
        }
    }
}