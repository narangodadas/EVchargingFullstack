using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace EVChargingStationWeb.Server.Models
{
    public enum BookingStatus
    {
        Active,
        Cancelled,
        Completed
    }

    public class Booking
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("stationId")]
        public string StationId { get; set; }

        [BsonElement("userId")]
        public string UserId { get; set; }  // NIC of EV owner or user id

        [BsonElement("reservationDate")]
        public DateTime ReservationDate { get; set; } // store in UTC

        [BsonElement("status")]
        public BookingStatus Status { get; set; } = BookingStatus.Active;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
