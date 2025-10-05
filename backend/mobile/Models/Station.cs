using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EVChargingAPI.Models
{
    public class Station
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; } = null!;

        [BsonElement("location")]
        public string Location { get; set; } = null!;

        [BsonElement("type")]
        public string Type { get; set; } = null!; // "AC" or "DC"

        [BsonElement("availableSlots")]
        public int AvailableSlots { get; set; }

        [BsonElement("totalSlots")]
        public int TotalSlots { get; set; }

        [BsonElement("operatingHours")]
        public string OperatingHours { get; set; } = "24/7";

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("coordinates")]
        public Coordinates? Coordinates { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Coordinates
    {
        [BsonElement("latitude")]
        public double Latitude { get; set; }

        [BsonElement("longitude")]
        public double Longitude { get; set; }
    }
}