import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import {
  Button,
  Dropdown,
  Option,
  Input,
  Title1,
  Subtitle2,
  Card,
  Toast,
  Toaster,
  useToastController,
  useId,
  ToastTitle,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Switch,
  Label,
  Spinner,
} from "@fluentui/react-components";
import {
  PhoneRegular,
  ArrowResetRegular,
  DismissCircleRegular,
  ArrowDownloadRegular,
  ArrowSyncRegular,
  PowerRegular,
  PlayRegular,
  SettingsRegular,
  FolderRegular,
} from "@fluentui/react-icons";

function App() {
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [dpi, setDpi] = useState<string>("420");
  const [currentDpi, setCurrentDpi] = useState<string>("");
  const [log, setLog] = useState<string>("");

  // Paths
  const [adbPath, setAdbPath] = useState<string>("");
  const [scrcpyPath, setScrcpyPath] = useState<string>("");
  const [adbInstalled, setAdbInstalled] = useState<boolean>(false);
  const [scrcpyInstalled, setScrcpyInstalled] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<string>("");

  // Scrcpy settings
  const [maxSize, setMaxSize] = useState("1920");
  const [bitrate, setBitrate] = useState("8M");
  const [maxFps, setMaxFps] = useState("60");
  const [videoCodec, setVideoCodec] = useState("h264");
  const [stayAwake, setStayAwake] = useState(true);
  const [turnScreenOff, setTurnScreenOff] = useState(false);
  const [disableScreensaver, setDisableScreensaver] = useState(true);
  const [alwaysOnTop, setAlwaysOnTop] = useState(false);
  const [noAudio, setNoAudio] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notify = (message: string, intent: "success" | "error" = "success") => {
    dispatchToast(
      <Toast><ToastTitle>{message}</ToastTitle></Toast>,
      { intent }
    );
  };

  const dpiPresets = ["200",  "280", "320", "360", "400", "420", "440", "480", "560"];
  const sizePresets = ["1024", "1280", "1600", "1920", "2560"];
  const fpsPresets = ["30", "60", "90", "120"];
  const bitratePresets = ["2M", "4M", "8M", "16M", "32M"];
  const codecPresets = ["h264", "h265", "av1"];

  const checkPaths = async () => {
    const adb: string = await invoke("get_adb_path");
    const scrcpy: string = await invoke("get_scrcpy_path");
    setAdbPath(adb);
    setScrcpyPath(scrcpy);
    const adbOk: boolean = await invoke("check_adb_installed");
    const scrcpyOk: boolean = await invoke("check_scrcpy_installed");
    setAdbInstalled(adbOk);
    setScrcpyInstalled(scrcpyOk);
  };

  const loadDevices = async () => {
    try {
      const output: string = await invoke("adb_devices");
      const lines = output.split("\n").slice(1);
      const parsed = lines
        .filter((line) => line.includes("device"))
        .map((line) => line.split("\t")[0].trim())
        .filter((s) => s.length > 0);
      setDevices(parsed);
      if (parsed.length > 0) {
        setSelectedDevice(parsed[0]);
        getDpi(parsed[0]);
      } else {
        setSelectedDevice("");
        setCurrentDpi("");
      }
      setLog(output);
    } catch (e) {
      setLog("Error: " + e);
    }
  };

  const getDpi = async (serial: string) => {
    try {
      const output: string = await invoke("adb_get_dpi", { serial });
      setCurrentDpi(output.trim());
    } catch {
      setCurrentDpi("Unknown");
    }
  };

  const applyDPI = async () => {
    if (!selectedDevice) return notify("Select a device first", "error");
    await invoke("adb_set_dpi", { serial: selectedDevice, dpi });
    notify(`DPI set to ${dpi}`);
    getDpi(selectedDevice);
  };

  const resetDPI = async () => {
    if (!selectedDevice) return notify("Select a device first", "error");
    await invoke("adb_reset_dpi", { serial: selectedDevice });
    notify("DPI reset to default");
    getDpi(selectedDevice);
  };

  const killADB = async () => {
    await invoke("adb_kill");
    notify("ADB server killed");
    setDevices([]);
    setSelectedDevice("");
  };

  const installAPK = async () => {
    if (!selectedDevice) return notify("Select a device first", "error");
    const file = await open({
      multiple: false,
      filters: [{ name: "APK", extensions: ["apk"] }],
    });
    if (file) {
      setLog("Installing APK...");
      const result: string = await invoke("adb_install", {
        serial: selectedDevice,
        path: file,
      });
      setLog(result);
      notify("APK installed");
    }
  };

  const reboot = async (mode: string) => {
    if (!selectedDevice) return notify("Select a device first", "error");
    const result: string = await invoke("adb_reboot", {
      serial: selectedDevice,
      mode,
    });
    notify(result);
  };

  const rotateScreen = async (direction: string) => {
    if (!selectedDevice) return notify("Select a device first", "error");
    try {
      const result: string = await invoke("rotate_screen", {
        serial: selectedDevice,
        direction,
      });
      notify(result);
    } catch (e) {
      notify("Rotation failed: " + e, "error");
    }
  };

  const startScrcpy = async () => {
    if (!selectedDevice) return notify("Select a device first", "error");
    try {
      const result: string = await invoke("launch_scrcpy", {
        serial: selectedDevice,
        maxSize,
        bitrate,
        maxFps,
        videoCodec,
        stayAwake,
        turnScreenOff,
        disableScreensaver,
        alwaysOnTop,
        noAudio,
        fullscreen,
      });
      setLog(result);
      notify("scrcpy launched");
    } catch (e) {
      notify("Failed: " + e, "error");
    }
  };

  const downloadADB = async () => {
    setDownloading("adb");
    try {
      const result: string = await invoke("download_adb");
      notify(result);
      await invoke("set_adb_path", { path: "C:\\Android\\platform-tools\\adb.exe" });
      await checkPaths();
    } catch (e) {
      notify("Download failed: " + e, "error");
    }
    setDownloading("");
  };

  const downloadScrcpy = async () => {
    setDownloading("scrcpy");
    try {
      const result: string = await invoke("download_scrcpy");
      notify(result);
      await invoke("set_scrcpy_path", { path: "C:\\Android\\scrcpy\\scrcpy.exe" });
      await checkPaths();
    } catch (e) {
      notify("Download failed: " + e, "error");
    }
    setDownloading("");
  };

  const browseADB = async () => {
    const file = await open({
      multiple: false,
      filters: [{ name: "Executable", extensions: ["exe"] }],
    });
    if (file) {
      await invoke("set_adb_path", { path: file });
      await checkPaths();
      notify("ADB path updated");
    }
  };

  const browseScrcpy = async () => {
    const file = await open({
      multiple: false,
      filters: [{ name: "Executable", extensions: ["exe"] }],
    });
    if (file) {
      await invoke("set_scrcpy_path", { path: file });
      await checkPaths();
      notify("scrcpy path updated");
    }
  };

  useEffect(() => {
    checkPaths().then(() => loadDevices());
  }, []);

  return (
    <div className="container">
      <Toaster toasterId={toasterId} />

      {/* ---- HEADER ---- */}
      <div className="header">
        <Title1 className="title">
          <PhoneRegular fontSize={28} /> ADB Manager
        </Title1>
        <Button
          icon={<SettingsRegular />}
          appearance="subtle"
          onClick={() => setShowSettings(!showSettings)}
        >
          Settings
        </Button>
      </div>

      {/* ---- SETTINGS PANEL ---- */}
      {showSettings && (
        <Card className="section-card">
          <Subtitle2>Binary Paths</Subtitle2>
          <div className="path-item">
            <Label>ADB: {adbInstalled ? "✅" : "❌ Not found"}</Label>
            <div className="row">
              <Input value={adbPath} readOnly style={{ flex: 1 }} />
              <Button icon={<FolderRegular />} onClick={browseADB}>Browse</Button>
            </div>
            {!adbInstalled && (
              <Button
                appearance="primary"
                onClick={downloadADB}
                disabled={downloading === "adb"}
                icon={downloading === "adb" ? <Spinner size="tiny" /> : <ArrowDownloadRegular />}
              >
                {downloading === "adb" ? "Downloading..." : "Download ADB to C:\\Android\\"}
              </Button>
            )}
          </div>
          <div className="path-item">
            <Label>scrcpy: {scrcpyInstalled ? "✅" : "❌ Not found"}</Label>
            <div className="row">
              <Input value={scrcpyPath} readOnly style={{ flex: 1 }} />
              <Button icon={<FolderRegular />} onClick={browseScrcpy}>Browse</Button>
            </div>
            {!scrcpyInstalled && (
              <Button
                appearance="primary"
                onClick={downloadScrcpy}
                disabled={downloading === "scrcpy"}
                icon={downloading === "scrcpy" ? <Spinner size="tiny" /> : <ArrowDownloadRegular />}
              >
                {downloading === "scrcpy" ? "Downloading..." : "Download scrcpy to C:\\Android\\"}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* ---- DEVICES ---- */}
      <Card className="section-card">
        <Subtitle2>Devices</Subtitle2>
        <div className="row">
          <Dropdown
            placeholder="Select Device"
            value={selectedDevice}
            onOptionSelect={(_, data) => {
              const val = data.optionValue ?? "";
              setSelectedDevice(val);
              getDpi(val);
            }}
            style={{ flex: 1 }}
          >
            {devices.map((d) => (
              <Option key={d} value={d}>{d}</Option>
            ))}
          </Dropdown>
          <Button icon={<ArrowSyncRegular />} onClick={loadDevices} appearance="subtle">
            Refresh
          </Button>
        </div>
        {currentDpi && (
          <Subtitle2 className="current-dpi">Current DPI: {currentDpi}</Subtitle2>
        )}
      </Card>

      {/* ---- DPI ---- */}
      <Card className="section-card">
        <Subtitle2>DPI Settings</Subtitle2>
        <div className="row">
          <Dropdown
            value={dpi}
            onOptionSelect={(_, data) => setDpi(data.optionValue ?? "420")}
          >
            {dpiPresets.map((p) => (
              <Option key={p} value={p}>{p}</Option>
            ))}
          </Dropdown>
          <Input
            value={dpi}
            onChange={(_, data) => setDpi(data.value)}
            style={{ width: 100 }}
          />
        </div>
        <div className="row">
          <Button appearance="primary" onClick={applyDPI}>Apply DPI</Button>
          <Button icon={<ArrowResetRegular />} onClick={resetDPI}>Reset DPI</Button>
        </div>
      </Card>

      {/* ---- SCREEN ROTATION ---- */}
      <Card className="section-card">
        <Subtitle2>Screen Rotation</Subtitle2>
        <div className="rotation-grid">
          <Button appearance="primary" onClick={() => rotateScreen("portrait")}>
            ⬆️ Portrait (0°)
          </Button>
          <Button appearance="primary" onClick={() => rotateScreen("landscape_left")}>
            ⬅️ Landscape Left (90°)
          </Button>
          <Button appearance="primary" onClick={() => rotateScreen("landscape_right")}>
            ➡️ Landscape Right (270°)
          </Button>
          <Button appearance="primary" onClick={() => rotateScreen("upside_down")}>
            ⬇️ Upside Down (180°)
          </Button>
        </div>
      </Card>

      {/* ---- SCRCPY ---- */}
      <Card className="section-card">
        <Subtitle2>Scrcpy Settings</Subtitle2>
        <div className="settings-grid">
          <div className="setting-item">
            <Label>Max Size</Label>
            <Dropdown
              value={maxSize}
              onOptionSelect={(_, data) => setMaxSize(data.optionValue ?? "1920")}
            >
              {sizePresets.map((s) => (
                <Option key={s} value={s}>{s}</Option>
              ))}
            </Dropdown>
          </div>
          <div className="setting-item">
            <Label>Bitrate</Label>
            <Dropdown
              value={bitrate}
              onOptionSelect={(_, data) => setBitrate(data.optionValue ?? "8M")}
            >
              {bitratePresets.map((b) => (
                <Option key={b} value={b}>{b}</Option>
              ))}
            </Dropdown>
          </div>
          <div className="setting-item">
            <Label>Max FPS</Label>
            <Dropdown
              value={maxFps}
              onOptionSelect={(_, data) => setMaxFps(data.optionValue ?? "60")}
            >
              {fpsPresets.map((f) => (
                <Option key={f} value={f}>{f}</Option>
              ))}
            </Dropdown>
          </div>
          <div className="setting-item">
            <Label>Codec</Label>
            <Dropdown
              value={videoCodec}
              onOptionSelect={(_, data) => setVideoCodec(data.optionValue ?? "h264")}
            >
              {codecPresets.map((c) => (
                <Option key={c} value={c}>{c}</Option>
              ))}
            </Dropdown>
          </div>
        </div>
        <div className="switch-grid">
          <Switch checked={stayAwake} onChange={(_, d) => setStayAwake(d.checked)} label="Stay Awake" />
          <Switch checked={disableScreensaver} onChange={(_, d) => setDisableScreensaver(d.checked)} label="No Screensaver" />
          <Switch checked={turnScreenOff} onChange={(_, d) => setTurnScreenOff(d.checked)} label="Screen Off" />
          <Switch checked={alwaysOnTop} onChange={(_, d) => setAlwaysOnTop(d.checked)} label="Always On Top" />
          <Switch checked={noAudio} onChange={(_, d) => setNoAudio(d.checked)} label="No Audio" />
          <Switch checked={fullscreen} onChange={(_, d) => setFullscreen(d.checked)} label="Fullscreen" />
        </div>
        <div className="row">
          <Button icon={<PlayRegular />} appearance="primary" onClick={startScrcpy} size="large">
            Launch scrcpy
          </Button>
        </div>
      </Card>

      {/* ---- ACTIONS ---- */}
      <Card className="section-card">
        <Subtitle2>Actions</Subtitle2>
        <div className="row">
          <Button icon={<ArrowDownloadRegular />} onClick={installAPK} appearance="primary">
            Install APK
          </Button>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button icon={<PowerRegular />}>Reboot</Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem onClick={() => reboot("normal")}>Normal</MenuItem>
                <MenuItem onClick={() => reboot("recovery")}>Recovery</MenuItem>
                <MenuItem onClick={() => reboot("bootloader")}>Bootloader</MenuItem>
                <MenuItem onClick={() => reboot("fastboot")}>Fastboot</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
          <Button icon={<DismissCircleRegular />} onClick={killADB}>Kill ADB</Button>
        </div>
      </Card>

      {/* ---- LOG ---- */}
      {log && (
        <Card className="section-card log-card">
          <Subtitle2>Log</Subtitle2>
          <pre className="log-output">{log}</pre>
        </Card>
      )}
    </div>
  );
}

export default App;