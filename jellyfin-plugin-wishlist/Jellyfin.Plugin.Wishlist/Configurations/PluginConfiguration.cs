using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.Wishlist.Configurations
{
    /// <summary>
    /// Wishlist PluginConfiguration.
    /// </summary>
    public class PluginConfiguration : BasePluginConfiguration
    {
        /// <summary>
        /// Gets or sets the API endpoint used by the plugin.
        /// </summary>
        public string ApiEndpoint { get; set; } = "https://example.com/wishlist";
    }
}
