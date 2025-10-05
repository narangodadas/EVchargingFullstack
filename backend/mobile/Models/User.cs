using System.Text.Json.Serialization; // Add this at the top
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EVChargingAPI.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [JsonPropertyName("nic")]
        [BsonElement("nic")]
        public string NIC { get; set; } = null!;

        [JsonPropertyName("name")]
        [BsonElement("name")]
        public string Name { get; set; } = null!;

        [JsonPropertyName("email")]
        [BsonElement("email")]
        public string Email { get; set; } = null!;

        [JsonPropertyName("password")]
        [BsonElement("password")]
        public string Password { get; set; } = null!;

        [JsonPropertyName("role")]
        [BsonElement("role")]
        public string Role { get; set; } = null!; // "evowner", "stationoperator", "backoffice"

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}