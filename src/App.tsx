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
  Divider,
  Toast,
  Toaster,
  useToastController,
  useId,
  ToastTitle,
} from "@fluentui/react-components";
import {
  PhoneRegular,
  ArrowResetRegular,
  DismissCircleRegular,
  ArrowDownloadRegular,
  ArrowSyncRegular,
  SettingsRegular,
} from "@fluentui/react-icons";

function App() {
  const [devices, setDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [dpi, setDpi] = useState<string>("420");
  const [currentDpi, setCurrentDpi] = useState<string>("");
  const [log, setLog] = useState<string>("");

  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notify = (message: string) => {
    dispatchToast(
      <Toast>
        <ToastTitle>{message}</ToastTitle>
      </Toast>,
      { intent: "success" }
    );
  };

  const dpiPresets = ["320", "360", "400", "420", "440", "480", "560"];

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
      }
      setLog(output);
    } catch (e) {
      setLog("Error loading devices: " + e);
    }
  };

  const getDpi = async (serial: string) => {
    try {
      const output: string = await invoke("adb_get_dpi", { serial });
      setCurrentDpi(output.trim());
    } catch (e) {
      setCurrentDpi("Unknown");
    }
  };

  const applyDPI = async () => {
    if (!selectedDevice) {
      notify("Select a device first");
      return;
    }
    try {
      await invoke("adb_set_dpi", { serial: selectedDevice, dpi });
      notify(`DPI set to ${dpi}`);
      getDpi(selectedDevice);
    } catch (e) {
      setLog("Error: " + e);
    }
  };

  const resetDPI = async () => {
    if (!selectedDevice) {
      notify("Select a device first");
      return;
    }
    try {
      await invoke("adb_reset_dpi", { serial: selectedDevice });
      notify("DPI reset to default");
      getDpi(selectedDevice);
    } catch (e) {
      setLog("Error: " + e);
    }
  };

  const killADB = async () => {
    try {
      await invoke("adb_kill");
      notify("ADB server killed");
      setDevices([]);
      setSelectedDevice("");
    } catch (e) {
      setLog("Error: " + e);
    }
  };

  const installAPK = async () => {
    if (!selectedDevice) {
      notify("Select a device first");
      return;
    }

    try {
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
        notify("APK installed successfully");
      }
    } catch (e) {
      setLog("Error: " + e);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  return (
    <div className="container">
      <Toaster toasterId={toasterId} />

      <Title1 className="title">
        <PhoneRegular fontSize={28} /> ADB Manager
      </Title1>

      {/* ---- DEVICES ---- */}
      <Card className="section-card">
        <Subtitle2>
          <SettingsRegular /> Devices
        </Subtitle2>

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
            {devices.map((device) => (
              <Option key={device} value={device}>
                {device}
              </Option>
            ))}
          </Dropdown>

          <Button
            icon={<ArrowSyncRegular />}
            onClick={loadDevices}
            appearance="subtle"
          >
            Refresh
          </Button>
        </div>

        {currentDpi && (
          <Subtitle2 className="current-dpi">
            Current: {currentDpi}
          </Subtitle2>
        )}
      </Card>

      {/* ---- DPI ---- */}
      <Card className="section-card">
        <Subtitle2>DPI Settings</Subtitle2>

        <div className="row">
          <Dropdown
            placeholder="Select DPI"
            value={dpi}
            onOptionSelect={(_, data) => setDpi(data.optionValue ?? "420")}
          >
            {dpiPresets.map((preset) => (
              <Option key={preset} value={preset}>
                {preset}
              </Option>
            ))}
          </Dropdown>

          <Input
            value={dpi}
            onChange={(_, data) => setDpi(data.value)}
            placeholder="Custom DPI"
            style={{ width: 100 }}
          />
        </div>

        <div className="row">
          <Button appearance="primary" onClick={applyDPI}>
            Apply DPI
          </Button>

          <Button
            icon={<ArrowResetRegular />}
            onClick={resetDPI}
            appearance="secondary"
          >
            Reset DPI
          </Button>
        </div>
      </Card>

      <Divider />

      {/* ---- ACTIONS ---- */}
      <Card className="section-card">
        <Subtitle2>Actions</Subtitle2>

        <div className="row">
          <Button
            icon={<ArrowDownloadRegular />}
            onClick={installAPK}
            appearance="primary"
          >
            Install APK
          </Button>

          <Button
            icon={<DismissCircleRegular />}
            onClick={killADB}
            appearance="secondary"
          >
            Kill ADB
          </Button>
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