using System.Threading.Tasks;
using Jellyfin.Plugin.Wishlist.Configurations;
using Jellyfin.Plugin.Wishlist.Models;
using MediaBrowser.Controller.Net;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.Wishlist.Controllers
{
    /// <summary>
    /// Wishlist controller.
    /// </summary>
    [Route("Wishlist")]
    [ApiController]
    public class WishlistController : ControllerBase
    {
        private readonly PluginConfiguration _config;
        private readonly IAuthorizationContext _authContext;

        /// <summary>
        /// Initializes a new instance of the <see cref="WishlistController"/> class.
        /// </summary>
        /// <param name="config">Instance of the <see cref="PluginConfiguration"/> interface.</param>
        /// <param name="authContext">Instance of the <see cref="IAuthorizationContext"/> interface.</param>
        public WishlistController(PluginConfiguration config, IAuthorizationContext authContext)
        {
            _config = config;
            _authContext = authContext;
        }

        /// <summary>
        /// add wishlist item.
        /// </summary>
        /// <param name="wishItem">Quick connect code to authorize.</param>
        /// <response code="200">Quick connect result authorized successfully.</response>
        /// <response code="403">Unknown user id.</response>
        /// <returns>Boolean indicating if the authorization was successful.</returns>
        [HttpPost("Add")]
        public async Task<ActionResult<bool>> Add([FromBody] WishItem wishItem)
        {
            // 获取当前用户
            var auth = await _authContext.GetAuthorizationInfo(Request).ConfigureAwait(false);
            return true;
        }
    }
}
