using MediaBrowser.Controller.Users;
using MediaBrowser.Controller.Plugins;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Jellyfin.Plugin.Wishlist.Controllers
{
    [Route("Wishlist")]
    [ApiController]
    public class WishlistController : ControllerBase
    {
        private readonly PluginConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IUserManager _userManager;

        public WishlistController(PluginConfiguration config, IHttpClientFactory httpClientFactory, IUserManager userManager)
        {
            _config = config;
            _httpClientFactory = httpClientFactory;
            _userManager = userManager;
        }

        [HttpPost("add")]
        public async Task<IActionResult> Add([FromBody] WishlistItem item)
        {
            // 获取当前用户
            var user = _userManager.GetUserById(ControllerContext.HttpContext.User.GetUserId());
            var username = user?.Name ?? "unknown";

            // 构造提交数据
            var payload = new
            {
                name = item.Name,
                username = username
            };

            var http = _httpClientFactory.CreateClient();
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var res = await http.PostAsync(_config.ApiEndpoint, content);

            if (res.IsSuccessStatusCode)
                return Ok();
            return StatusCode((int)res.StatusCode);
        }
    }

    public class WishlistItem
    {
        public string Name { get; set; }
    }
}
