namespace EVChargingStationWeb.Server.Models
{
    using MongoDB.Bson.Serialization.Attributes;
    using System;

    public class EVOwner
    {
        [BsonId]
        public string NIC { get; set; }

        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}