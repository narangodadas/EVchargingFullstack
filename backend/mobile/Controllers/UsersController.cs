/*******************************************************
*file :         UsersController.cs
*Author:        IT22149626 - Chandrasiri G.A.S.D.
********************************************************/


using Microsoft.AspNetCore.Mvc;
using EVChargingAPI.Services;
using EVChargingAPI.Models;
using MongoDB.Driver;

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

        // POST: api/users/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Case-insensitive NIC search
            var filter = Builders<User>.Filter.Regex(u => u.NIC,
                            new MongoDB.Bson.BsonRegularExpression($"^{request.NIC}$", "i"))
                       & Builders<User>.Filter.Eq(u => u.Password, request.Password)
                       & Builders<User>.Filter.Eq(u => u.Role, request.Role)
                       & Builders<User>.Filter.Eq(u => u.IsActive, true);

            var user = await _mongoDBService.Users.Find(filter).FirstOrDefaultAsync();

            if (user == null)
            {
                // More specific error message
                var basicFilter = Builders<User>.Filter.Regex(u => u.NIC,
                    new MongoDB.Bson.BsonRegularExpression($"^{request.NIC}$", "i"));
                var userExists = await _mongoDBService.Users.Find(basicFilter).FirstOrDefaultAsync();
                
                if (userExists == null)
                {
                    return Unauthorized(new { message = "Invalid NIC or Password" });
                }
                else if (userExists.Password != request.Password)
                {
                    return Unauthorized(new { message = "Invalid NIC or Password" });
                }
                else if (userExists.Role != request.Role)
                {
                    return Unauthorized(new { message = "User role does not match selected role" });
                }
                else if (!userExists.IsActive)
                {
                    return Unauthorized(new { message = "Account is deactivated. Please contact administrator." });
                }
                else
                {
                    return Unauthorized(new { message = "Invalid login credentials" });
                }
            }

            return Ok(new
            {
                message = "Login successful",
                user = new { user.Id, user.NIC, user.Name, user.Email, user.Role, user.IsActive }
            });
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
                .Set(u => u.Name, request.Name ?? user.Name)
                .Set(u => u.Email, request.Email ?? user.Email)
                .Set(u => u.Password, request.Password ?? user.Password);

            await _mongoDBService.Users.UpdateOneAsync(filter, update);
            return Ok(new { message = "User updated successfully" });
        }

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

        [HttpGet("check/{nic}")]
        public async Task<IActionResult> CheckUserExists(string nic)
        {
           var filter = Builders<User>.Filter.Regex(u => u.NIC,
                new MongoDB.Bson.BsonRegularExpression($"^{nic}$", "i"));
            var user = await _mongoDBService.Users.Find(filter).FirstOrDefaultAsync();
            return Ok(new { exists = user != null });
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] User user)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                );
                return BadRequest(new { message = "One or more validation errors have occurred.", errors = errors });
            }

            var filter = Builders<User>.Filter.Regex(u => u.NIC,
                new MongoDB.Bson.BsonRegularExpression($"^{user.NIC}$", "i"));
            var existingUser = await _mongoDBService.Users.Find(filter).FirstOrDefaultAsync();

            if (existingUser != null)
            {
                return BadRequest(new { message = "User with this NIC already exists" });
            }

            user.CreatedAt = DateTime.UtcNow;
            user.IsActive = true; // Ensure new users are active by default
            await _mongoDBService.Users.InsertOneAsync(user);
            return Ok(new { message = "User registered successfully" });
        }
    }

    public class LoginRequest
    {
        public string NIC { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string Role { get; set; } = null!;
    }
    
    public class UserUpdateRequest
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
    }
}