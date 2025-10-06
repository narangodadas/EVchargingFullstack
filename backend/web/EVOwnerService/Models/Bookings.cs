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

        public string UserId { get; set; }           // NIC of EV Owner
        public string StationId { get; set; }        // Station identifier

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime BookingDate { get; set; }

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime StartTime { get; set; }

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime EndTime { get; set; }

        public string Status { get; set; }           // pending, confirmed, cancelled
        public string VehicleType { get; set; }
        public decimal TotalCost { get; set; }
        public string QrCodeData { get; set; }       // optional, generated after confirmation

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
