using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace EVChargingAPI.Models
{
    public class Booking
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; } = null!; // Reference to User

        [BsonElement("stationId")]
        public string StationId { get; set; } = null!; // Reference to Station

        [BsonElement("bookingDate")]
        public DateTime BookingDate { get; set; }

        [BsonElement("startTime")]
        public DateTime StartTime { get; set; }

        [BsonElement("endTime")]
        public DateTime EndTime { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "pending"; // "pending", "confirmed", "cancelled", "completed"

        [BsonElement("vehicleType")]
        public string VehicleType { get; set; } = null!;

        [BsonElement("totalCost")]
        public decimal TotalCost { get; set; }

        [BsonElement("qrCodeData")]
        public string? QRCodeData { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}