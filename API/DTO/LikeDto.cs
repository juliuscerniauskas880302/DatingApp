using System;

namespace API.DTO
{
    public class LikeDto
    {
        public int Id { get; set; }

        public string Username { get; set; }

        public int Age { get; set; }

        public String KnownAs { get; set; }

        public string PhotoUrl { get; set; }

        public string Country { get; set; }
    }
}