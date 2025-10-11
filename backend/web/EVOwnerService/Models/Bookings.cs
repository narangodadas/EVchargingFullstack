using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace EVChargingStationWeb.Server.Models
{
    public class Booking
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; }

        [BsonElement("stationId")]
        public string StationId { get; set; }

        [BsonElement("bookingDate")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime BookingDate { get; set; }

        [BsonElement("startTime")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime StartTime { get; set; }

        [BsonElement("endTime")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime EndTime { get; set; }

        [BsonElement("status")]
        public string Status { get; set; }

        [BsonElement("vehicleType")]
        public string VehicleType { get; set; }

        [BsonElement("totalCost")]
        public decimal TotalCost { get; set; }

        [BsonElement("qrCodeData")]
        public string QrCodeData { get; set; }

        [BsonElement("createdAt")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
