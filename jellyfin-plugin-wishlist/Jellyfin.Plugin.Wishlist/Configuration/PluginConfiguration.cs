using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.Wishlist.Configuration;

public class PluginConfiguration : BasePluginConfiguration
{
    // 第三方接口 URL
    public string ApiEndpoint { get; set; } = "https://example.com/wishlist";
}
