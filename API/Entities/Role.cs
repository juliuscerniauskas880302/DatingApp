using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace API.Entities
{
    public class Role: IdentityRole<int>
    {
        public ICollection<AppUserRole> UserRoles { get; set; }
    }
}