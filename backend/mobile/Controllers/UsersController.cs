using Microsoft.AspNetCore.Mvc;
using EVChargingAPI.Services;
using EVChargingAPI.Models;
using MongoDB.Driver; // Add this line
using System.Text.Json.Serialization;

namespace EVChargingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly MongoDBService _mongoDBService;

        public UsersController(MongoDBService mongoDBService)
        {
            _mongoDBService = mongoDBService;
        }

        [HttpPut("update/{nic}")]
        public async Task<IActionResult> UpdateUser(string nic, [FromBody] UserUpdateRequest request)
        {
            var filter = Builders<User>.Filter.Regex(u => u.NIC,
             new MongoDB.Bson.BsonRegularExpression($"^{nic}$", "i"));
            var user = await _mongoDBService.Users.Find(filter).FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var update = Builders<User>.Update
                .Set(u => u.Name, request.Name)
                .Set(u => u.Email, request.Email)
                .Set(u => u.Password, request.Password);

            await _mongoDBService.Users.UpdateOneAsync(filter, update);
            return Ok(new { message = "User updated successfully" });
        }

        // PUT: api/users/deactivate/{nic}
        [HttpPut("deactivate/{nic}")]
        public async Task<IActionResult> DeactivateUser(string nic)
        {
            var filter = Builders<User>.Filter.Regex(u => u.NIC,
                new MongoDB.Bson.BsonRegularExpression($"^{nic}$", "i"));

            var user = await _mongoDBService.Users.Find(filter).FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var update = Builders<User>.Update.Set(u => u.IsActive, false);
            await _mongoDBService.Users.UpdateOneAsync(filter, update);

            return Ok(new { message = "User deactivated successfully" });
        }

        // PUT: api/users/reactivate/{nic} (Backoffice only)
        [HttpPut("reactivate/{nic}")]
        public async Task<IActionResult> ReactivateUser(string nic)
        {
           var filter = Builders<User>.Filter.Regex(u => u.NIC,
                new MongoDB.Bson.BsonRegularExpression($"^{nic}$", "i"));
            var user = await _mongoDBService.Users.Find(filter).FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var update = Builders<User>.Update.Set(u => u.IsActive, true);
            await _mongoDBService.Users.UpdateOneAsync(filter, update);

            return Ok(new { message = "User reactivated successfully" });
        }


        // GET: api/users/check/{nic}
        [HttpGet("check/{nic}")]
        public async Task<IActionResult> CheckUserExists(string nic)
        {
           var filter = Builders<User>.Filter.Regex(u => u.NIC,
                new MongoDB.Bson.BsonRegularExpression($"^{nic}$", "i"));
            var user = await _mongoDBService.Users.Find(filter).FirstOrDefaultAsync();
            return Ok(new { exists = user != null });
        }

        // POST: api/users/register
        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] User user)
        {
            // Check if user already exists
           var filter = Builders<User>.Filter.Regex(u => u.NIC,
                new MongoDB.Bson.BsonRegularExpression($"^{user.NIC}$", "i"));
            var existingUser = await _mongoDBService.Users.Find(filter).FirstOrDefaultAsync();

            if (existingUser != null)
            {
                return BadRequest(new { message = "User with this NIC already exists" });
            }

            user.CreatedAt = DateTime.UtcNow;
            await _mongoDBService.Users.InsertOneAsync(user);
            return Ok(new { message = "User registered successfully" });
        }

        // POST: api/users/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var filter = Builders<User>.Filter.Regex(u => u.NIC,
                            new MongoDB.Bson.BsonRegularExpression($"^{request.NIC}$", "i"))
                       & Builders<User>.Filter.Eq(u => u.Password, request.Password);

            var user = await _mongoDBService.Users.Find(filter).FirstOrDefaultAsync();

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid NIC or Password" });
            }

            return Ok(new
            {
                message = "Login successful",
                user = new { user.Id, user.NIC, user.Name, user.Email, user.Role }
            });
        }
    }
public class LoginRequest
{
    [JsonPropertyName("nic")]
    public string NIC { get; set; } = null!;

    [JsonPropertyName("password")]
    public string Password { get; set; } = null!;
}public class UserUpdateRequest
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = null!;

    [JsonPropertyName("email")]
    public string Email { get; set; } = null!;

    [JsonPropertyName("password")]
    public string Password { get; set; } = null!;
}
}