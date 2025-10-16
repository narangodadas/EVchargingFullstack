/*******************************************************
*file :         Booking.cs
*Author:        IT22278180 - Narangoda D.A.S.
********************************************************/


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
        public string UserId { get; set; } = null!;

        [BsonElement("stationId")]
        public string StationId { get; set; } = null!;

        [BsonElement("stationName")]
        public string StationName { get; set; } = null!;

        [BsonElement("bookingDate")]
        public DateTime BookingDate { get; set; }

        [BsonElement("startTime")]
        public DateTime StartTime { get; set; }

        [BsonElement("endTime")]
        public DateTime EndTime { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "pending";

        [BsonElement("isCompleted")]
        public bool IsCompleted { get; set; } = false; // NEW FIELD - initial false

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