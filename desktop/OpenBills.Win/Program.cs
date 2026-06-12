using System.Reflection;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace OpenBills.Win;

internal static class Program
{
    [STAThread]
    private static void Main()
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new MainForm());
    }
}

public sealed class MainForm : Form
{
    private readonly WebView2 webView = new() { Dock = DockStyle.Fill };
    private readonly NotifyIcon notifyIcon = new() { Visible = true, Text = "OpenBills" };
    private bool isQuitting;

    public MainForm()
    {
        var icon = LoadAppIcon();
        Icon = icon;
        notifyIcon.Icon = icon;
        notifyIcon.ContextMenuStrip = BuildTrayMenu();
        Text = "OpenBills";
        Width = 1180;
        Height = 780;
        MinimumSize = new Size(900, 640);
        StartPosition = FormStartPosition.CenterScreen;
        if (Environment.GetCommandLineArgs().Any(argument => argument.Equals("--minimized", StringComparison.OrdinalIgnoreCase)))
        {
            WindowState = FormWindowState.Minimized;
            ShowInTaskbar = false;
        }
        Controls.Add(webView);
        Load += async (_, _) => await InitializeAsync();
        Resize += (_, _) =>
        {
            if (WindowState == FormWindowState.Minimized)
            {
                ShowInTaskbar = false;
            }
        };
        notifyIcon.DoubleClick += (_, _) =>
        {
            RestoreWindow();
        };
    }

    private ContextMenuStrip BuildTrayMenu()
    {
        var menu = new ContextMenuStrip();
        menu.Items.Add("Open OpenBills", null, (_, _) => RestoreWindow());
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add("Quit OpenBills", null, (_, _) =>
        {
            isQuitting = true;
            notifyIcon.Visible = false;
            Application.Exit();
        });
        return menu;
    }

    private void RestoreWindow()
    {
        Show();
        ShowInTaskbar = true;
        WindowState = FormWindowState.Normal;
        Activate();
    }

    private static Icon LoadAppIcon()
    {
        var resource = Assembly.GetExecutingAssembly().GetManifestResourceStream("OpenBills.ico");
        return resource is null ? SystemIcons.Application : new Icon(resource);
    }

    private async Task InitializeAsync()
    {
        var appData = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "OpenBills");
        Directory.CreateDirectory(appData);

        var appFile = Path.Combine(appData, "openbills.html");
        await using (var resource = Assembly.GetExecutingAssembly().GetManifestResourceStream("openbills.html")
            ?? throw new InvalidOperationException("OpenBills UI resource was not embedded."))
        await using (var output = File.Create(appFile))
        {
            await resource.CopyToAsync(output);
        }

        var userData = Path.Combine(appData, "WebView2");
        var environment = await CoreWebView2Environment.CreateAsync(userDataFolder: userData);
        await webView.EnsureCoreWebView2Async(environment);
        webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
        webView.CoreWebView2.WebMessageReceived += HandleWebMessage;
        webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "openbills.local",
            appData,
            CoreWebView2HostResourceAccessKind.DenyCors);
        webView.CoreWebView2.Navigate("https://openbills.local/openbills.html");
    }

    private void HandleWebMessage(object? sender, CoreWebView2WebMessageReceivedEventArgs eventArgs)
    {
        try
        {
            using var message = JsonDocument.Parse(eventArgs.TryGetWebMessageAsString());
            var root = message.RootElement;
            var type = root.GetProperty("type").GetString();

            if (type == "settings")
            {
                var startWithWindows = root.TryGetProperty("startWithWindows", out var startElement) && startElement.GetBoolean();
                var startMinimized = root.TryGetProperty("startMinimized", out var minimizedElement) && minimizedElement.GetBoolean();
                ConfigureStartup(startWithWindows, startMinimized);
                return;
            }

            if (type == "notify")
            {
                var title = root.TryGetProperty("title", out var titleElement) ? titleElement.GetString() : "OpenBills";
                var body = root.TryGetProperty("body", out var bodyElement) ? bodyElement.GetString() : "";
                notifyIcon.ShowBalloonTip(6000, title ?? "OpenBills", body ?? "", ToolTipIcon.Info);
            }
        }
        catch
        {
            notifyIcon.ShowBalloonTip(4000, "OpenBills", "The desktop setting could not be applied.", ToolTipIcon.Warning);
        }
    }

    private static void ConfigureStartup(bool enabled, bool startMinimized)
    {
        var startupFolder = Environment.GetFolderPath(Environment.SpecialFolder.Startup);
        var shortcutPath = Path.Combine(startupFolder, "OpenBills.lnk");

        if (!enabled)
        {
            if (File.Exists(shortcutPath))
            {
                File.Delete(shortcutPath);
            }
            return;
        }

        var shellType = Type.GetTypeFromProgID("WScript.Shell")
            ?? throw new InvalidOperationException("Windows shortcut support is unavailable.");
        dynamic shell = Activator.CreateInstance(shellType)
            ?? throw new InvalidOperationException("Windows shortcut support is unavailable.");
        dynamic shortcut = shell.CreateShortcut(shortcutPath);
        shortcut.TargetPath = Application.ExecutablePath;
        shortcut.WorkingDirectory = AppContext.BaseDirectory;
        shortcut.Arguments = startMinimized ? "--minimized" : "";
        shortcut.Description = "OpenBills";
        shortcut.IconLocation = Application.ExecutablePath;
        shortcut.Save();
    }

    protected override void OnFormClosing(FormClosingEventArgs e)
    {
        if (!isQuitting && e.CloseReason == CloseReason.UserClosing)
        {
            e.Cancel = true;
            WindowState = FormWindowState.Minimized;
            ShowInTaskbar = false;
            Hide();
            notifyIcon.ShowBalloonTip(3000, "OpenBills is still running", "Right-click the tray icon and choose Quit OpenBills to close it.", ToolTipIcon.Info);
            return;
        }

        notifyIcon.Visible = false;
        notifyIcon.Dispose();
        base.OnFormClosing(e);
    }
}
