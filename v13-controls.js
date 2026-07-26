(function () {
  "use strict";

  const VERSION = "13.0.0-dev.9";
  const PREFIXES = [
    "mzjV7",
    "mzjV8",
    "mzjV9",
    "mzjV10",
    "mzjV11",
    "mzjV12",
    "mzjV13",
    "zepboundProcess",
  ];

  const CONFIG_KEY = "mzjV13CloudConfig";
  const META_KEY = "mzjV13FoundationMeta";
  const JOURNAL_KEY = "mzjV13ChangeJournal";
  const CLOCK_KEY = "mzjV13CloudClock";
  const DEVICE_KEY = "mzjV13DeviceId";
  const PHOTO_DB = "mzjProgressPhotos";
  const PHOTO_STORE = "photos";

  let applyingCloud = false;

  const $ = (id) => document.getElementById(id);

  const parse = (value, fallback = null) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const appKeys = () =>
    Object.keys(localStorage)
      .filter(
        (key) =>
          PREFIXES.some((prefix) => key.startsWith(prefix)) &&
          ![
            CONFIG_KEY,
            META_KEY,
            JOURNAL_KEY,
            "mzjV13Errors",
            CLOCK_KEY,
          ].includes(key)
      )
      .sort();

  function setStatus(text) {
    const element = $("v13StatusText");
    if (element) element.textContent = text;
  }

  function download(name, data, type = "application/json") {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const link = document.createElement("a");

    link.href = url;
    link.download = name;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(PHOTO_DB, 1);

      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(PHOTO_STORE)) {
          request.result.createObjectStore(PHOTO_STORE);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  function dataURLToBlob(url) {
    const [header, body] = url.split(",");
    const mime =
      (header.match(/data:([^;]+)/) || [])[1] ||
      "application/octet-stream";

    const raw = atob(body);
    const bytes = new Uint8Array(raw.length);

    for (let index = 0; index < raw.length; index += 1) {
      bytes[index] = raw.charCodeAt(index);
    }

    return new Blob([bytes], { type: mime });
  }

  async function getPhotos() {
    try {
      const db = await openDb();

      const result = await new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE, "readonly");
        const store = transaction.objectStore(PHOTO_STORE);
        const keyRequest = store.getAllKeys();
        const valueRequest = store.getAll();

        transaction.oncomplete = async () => {
          const photos = [];

          for (let index = 0; index < keyRequest.result.length; index += 1) {
            const blob = valueRequest.result[index];

            if (blob) {
              photos.push({
                key: String(keyRequest.result[index]),
                type: blob.type || "application/octet-stream",
                data: await blobToDataURL(blob),
              });
            }
          }

          resolve(photos);
        };

        transaction.onerror = () => reject(transaction.error);
      });

      db.close();
      return result;
    } catch (error) {
      console.error("Photo backup error", error);
      return [];
    }
  }

  async function replacePhotos(photos) {
    const db = await openDb();

    await new Promise((resolve, reject) => {
      const transaction = db.transaction(PHOTO_STORE, "readwrite");
      transaction.objectStore(PHOTO_STORE).clear();
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });

    for (const photo of photos || []) {
      await new Promise((resolve, reject) => {
        const transaction = db.transaction(PHOTO_STORE, "readwrite");

        transaction
          .objectStore(PHOTO_STORE)
          .put(dataURLToBlob(photo.data), photo.key);

        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
    }

    db.close();
  }

  async function makeBackup(silent = false) {
    const button = $("v13BackupBtn");

    if (button) {
      button.disabled = true;
      button.textContent = "Preparing backup…";
    }

    try {
      const storage = {};

      appKeys().forEach((key) => {
        storage[key] = parse(
          localStorage.getItem(key),
          localStorage.getItem(key)
        );
      });

      const photos = await getPhotos();
      const createdAt = new Date().toISOString();

      const backup = {
        format: "my-zepbound-journey-backup",
        schemaVersion: 2,
        createdAt,
        app: {
          name: "My Zepbound Journey",
          version: VERSION,
          channel: "Development",
        },
        integrity: {
          localStorageKeys: Object.keys(storage).length,
          photoCount: photos.length,
        },
        storage,
        photos,
      };

      download(
        `My_Zepbound_Journey_Backup_${createdAt.slice(0, 10)}.json`,
        JSON.stringify(backup, null, 2)
      );

      const meta =
        parse(localStorage.getItem(META_KEY), {}) || {};

      meta.lastBackupAt = createdAt;
      localStorage.setItem(META_KEY, JSON.stringify(meta));

      if (!silent) {
        alert(
          `Backup created successfully.\n\n` +
            `${Object.keys(storage).length} data sections\n` +
            `${photos.length} saved photos`
        );
      }

      return backup;
    } catch (error) {
      alert(`Backup could not be created.\n\n${error.message}`);
      throw error;
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Complete backup";
      }
    }
  }

  function normalize(raw) {
    if (
      raw &&
      raw.format === "my-zepbound-journey-backup"
    ) {
      return raw;
    }

    if (
      raw &&
      typeof raw === "object" &&
      !Array.isArray(raw)
    ) {
      const storage = {};

      Object.keys(raw)
        .filter((key) =>
          PREFIXES.some((prefix) => key.startsWith(prefix))
        )
        .forEach((key) => {
          storage[key] = parse(raw[key], raw[key]);
        });

      if (Object.keys(storage).length) {
        return {
          format: "my-zepbound-journey-backup",
          schemaVersion: 2,
          createdAt: new Date().toISOString(),
          storage,
          photos: [],
        };
      }
    }

    throw new Error(
      "This is not a recognized Zepbound backup file."
    );
  }

  async function restoreFile(file) {
    if (!file) return;

    try {
      const backup = normalize(
        JSON.parse(await file.text())
      );

      if (
        !backup.storage ||
        typeof backup.storage !== "object"
      ) {
        throw new Error(
          "The backup has no data section."
        );
      }

      const confirmed = confirm(
        `Restore this backup?\n\n` +
          `Data sections: ${Object.keys(backup.storage).length}\n` +
          `Photos: ${(backup.photos || []).length}\n\n` +
          `A safety backup downloads first.`
      );

      if (!confirmed) return;

      await makeBackup(true);

      appKeys().forEach((key) =>
        localStorage.removeItem(key)
      );

      Object.entries(backup.storage).forEach(
        ([key, value]) => {
          localStorage.setItem(
            key,
            typeof value === "string"
              ? value
              : JSON.stringify(value)
          );
        }
      );

      await replacePhotos(backup.photos || []);

      alert(
        "Restore completed. The app will reload."
      );

      location.reload();
    } catch (error) {
      alert(
        `Restore stopped safely.\n\n${error.message}`
      );
    } finally {
      const input = $("v13RestoreFile");
      if (input) input.value = "";
    }
  }

  function ensureModals() {
    if ($("v13DiagnosticsModal")) return;

    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="v13-modal" id="v13DiagnosticsModal" hidden>
        <section>
          <header>
            <div>
              <span class="v13-dev-badge">DEVELOPMENT</span>
              <h2>Version 13 Diagnostics</h2>
            </div>
            <button id="v13CloseDiagnostics" type="button">×</button>
          </header>

          <div class="v13-diag-grid" id="v13DiagGrid"></div>

          <h3>Recent errors</h3>
          <div class="v13-errors" id="v13ErrorList"></div>

          <button id="v13RefreshDiagnostics" type="button">
            Refresh
          </button>
        </section>
      </div>

      <div class="v13-modal" id="v13CloudModal" hidden>
        <section>
          <header>
            <div>
              <span class="v13-dev-badge">PRIVATE CONNECTION</span>
              <h2>Cloud setup</h2>
            </div>
            <button id="v13CloseCloud" type="button">×</button>
          </header>

          <label>
            Cloudflare Worker address
            <input
              id="v13ApiUrl"
              type="url"
              placeholder="https://my-zepbound-sync.your-name.workers.dev"
            >
          </label>

          <label>
            Private access token
            <input
              id="v13ApiToken"
              type="password"
              autocomplete="off"
            >
          </label>

          <p class="v13-cloud-note">
            Enter the same address and token on the laptop and iPhone.
          </p>

          <button id="v13SaveCloud" type="button">
            Save and test connection
          </button>
        </section>
      </div>
      `
    );
  }

  function diagnostics() {
    ensureModals();

    const config =
      parse(localStorage.getItem(CONFIG_KEY), {}) || {};

    const meta =
      parse(localStorage.getItem(META_KEY), {}) || {};

    const rows = [
      ["App version", VERSION],
      [
        "Connection",
        navigator.onLine ? "Online" : "Offline",
      ],
      [
        "Cloud configured",
        config.apiUrl && config.token ? "Yes" : "No",
      ],
      ["Data sections", appKeys().length],
      [
        "Last backup",
        meta.lastBackupAt
          ? new Date(meta.lastBackupAt).toLocaleString()
          : "None",
      ],
      [
        "Service worker",
        navigator.serviceWorker?.controller
          ? "Active"
          : "Waiting",
      ],
    ];

    $("v13DiagGrid").innerHTML = rows
      .map(
        ([label, value]) =>
          `<article>
            <small>${label}</small>
            <strong>${String(value)}</strong>
          </article>`
      )
      .join("");

    $("v13ErrorList").innerHTML =
      "<p>Safety controls and cloud synchronization are active.</p>";

    $("v13DiagnosticsModal").hidden = false;
  }

  function openCloud() {
    ensureModals();

    const config =
      parse(localStorage.getItem(CONFIG_KEY), {}) || {};

    $("v13ApiUrl").value = config.apiUrl || "";
    $("v13ApiToken").value = config.token || "";
    $("v13CloudModal").hidden = false;
  }

  async function saveCloud() {
    const apiUrl = $("v13ApiUrl")
      .value.trim()
      .replace(/\/$/, "");

    const token = $("v13ApiToken").value.trim();

    if (!apiUrl || !token) {
      alert(
        "Enter the Worker address and access token."
      );
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/api/health`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Connection failed (${response.status})`
        );
      }

      localStorage.setItem(
        CONFIG_KEY,
        JSON.stringify({ apiUrl, token })
      );

      $("v13CloudModal").hidden = true;

      setStatus(
        "Cloud connected · ready to synchronize"
      );

      alert("Cloud connection accepted.");
    } catch (error) {
      alert(
        `Connection was not accepted.\n\n${error.message}`
      );
    }
  }

  function deviceId() {
    let id = localStorage.getItem(DEVICE_KEY);

    if (!id) {
      id = crypto.randomUUID
        ? crypto.randomUUID()
        : `device-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`;

      localStorage.setItem(DEVICE_KEY, id);
    }

    return id;
  }

  function readJournal() {
    return (
      parse(localStorage.getItem(JOURNAL_KEY), {}) ||
      {}
    );
  }

  function writeJournal(journal) {
    localStorage.setItem(
      JOURNAL_KEY,
      JSON.stringify(journal)
    );
  }

  function readClock() {
    return (
      parse(localStorage.getItem(CLOCK_KEY), {}) ||
      {}
    );
  }

  function writeClock(clock) {
    localStorage.setItem(
      CLOCK_KEY,
      JSON.stringify(clock)
    );
  }

  function recordChange(key, value, deleted = false) {
    if (
      applyingCloud ||
      !PREFIXES.some((prefix) =>
        key.startsWith(prefix)
      )
    ) {
      return;
    }

    const journal = readJournal();

    journal[key] = {
      key,
      value: deleted
        ? null
        : typeof value === "string"
        ? parse(value, value)
        : value,
      updatedAt: new Date().toISOString(),
      deviceId: deviceId(),
      deleted: Boolean(deleted),
    };

    writeJournal(journal);
  }

  const originalSetItem =
    Storage.prototype.setItem;

  const originalRemoveItem =
    Storage.prototype.removeItem;

  if (!window.__mzjV13StorageWrapped) {
    Storage.prototype.setItem = function (
      key,
      value
    ) {
      originalSetItem.call(this, key, value);

      if (this === localStorage) {
        recordChange(String(key), value, false);
      }
    };

    Storage.prototype.removeItem = function (key) {
      originalRemoveItem.call(this, key);

      if (this === localStorage) {
        recordChange(String(key), null, true);
      }
    };

    window.__mzjV13StorageWrapped = true;
  }

  async function api(config, path, options = {}) {
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${config.token}`,
    };

    if (
      options.body &&
      !headers["Content-Type"]
    ) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(
      config.apiUrl + path,
      {
        ...options,
        headers,
      }
    );

    if (!response.ok) {
      let detail = "";

      try {
        const body = await response.json();
        detail = body.detail || body.error || "";
      } catch {
        detail = "";
      }

      throw new Error(
        `Cloud request failed (${response.status})` +
          (detail ? `: ${detail}` : "")
      );
    }

    if (response.status === 204) return null;

    return response.json();
  }

  async function sync() {
    const config =
      parse(localStorage.getItem(CONFIG_KEY), {}) ||
      {};

    if (!config.apiUrl || !config.token) {
      openCloud();
      return;
    }

    const button = $("v13SyncBtn");

    if (button) {
      button.disabled = true;
      button.textContent = "Synchronizing…";
    }

    setStatus("Synchronizing with Cloudflare…");

    try {
      let cloud =
        (await api(config, "/api/records"))
          .records || [];

      const cloudMap = Object.fromEntries(
        cloud.map((record) => [
          record.key,
          record,
        ])
      );

      const clock = readClock();
      let journal = readJournal();

      applyingCloud = true;

      try {
        for (const record of cloud) {
          const pending = journal[record.key];
          const localStamp =
            clock[record.key] || "";

          if (pending) continue;

          if (
            !localStamp ||
            record.updated_at > localStamp
          ) {
            if (record.deleted) {
              originalRemoveItem.call(
                localStorage,
                record.key
              );
            } else {
              originalSetItem.call(
                localStorage,
                record.key,
                typeof record.value === "string"
                  ? record.value
                  : JSON.stringify(record.value)
              );
            }

            clock[record.key] =
              record.updated_at;
          }
        }
      } finally {
        applyingCloud = false;
      }

      for (const key of appKeys()) {
        if (!cloudMap[key] && !journal[key]) {
          const raw = localStorage.getItem(key);

          journal[key] = {
            key,
            value: parse(raw, raw),
            updatedAt: new Date().toISOString(),
            deviceId: deviceId(),
            deleted: false,
          };
        }
      }

      writeJournal(journal);

      for (const [key, item] of Object.entries(
        journal
      )) {
        await api(config, "/api/records", {
          method: "POST",
          body: JSON.stringify(item),
        });

        clock[key] = item.updatedAt;
        delete journal[key];
        writeJournal(journal);
      }

      writeClock(clock);

      cloud =
        (await api(config, "/api/records"))
          .records || [];

      applyingCloud = true;

      try {
        for (const record of cloud) {
          if (record.deleted) {
            originalRemoveItem.call(
              localStorage,
              record.key
            );
          } else {
            originalSetItem.call(
              localStorage,
              record.key,
              typeof record.value === "string"
                ? record.value
                : JSON.stringify(record.value)
            );
          }

          clock[record.key] =
            record.updated_at;
        }
      } finally {
        applyingCloud = false;
      }

      writeClock(clock);

      setStatus(
        `Synchronized · ${cloud.length} cloud records`
      );

      alert(
        `Synchronization completed.\n\n` +
          `${cloud.length} data sections are stored in Cloudflare.`
      );

      setTimeout(() => location.reload(), 250);
    } catch (error) {
      console.error("Sync failed", error);

      setStatus(
        "Synchronization error · local data remains safe"
      );

      alert(
        `Synchronization stopped safely.\n\n` +
          `${error.message}\n\n` +
          `Your information remains on this device.`
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Sync now";
      }
    }
  }

  window.MZJFoundation = {
    ...(window.MZJFoundation || {}),
    version: VERSION,
    recordChange,
    syncNow: sync,
  };

  function bind() {
    ensureModals();

    const config =
      parse(localStorage.getItem(CONFIG_KEY), {}) ||
      {};

    setStatus(
      config.apiUrl
        ? "Cloud configured · ready"
        : "Cloud connection needs setup"
    );

    const pairs = [
      ["v13BackupBtn", () => makeBackup()],
      [
        "v13RestoreBtn",
        () => $("v13RestoreFile")?.click(),
      ],
      ["v13DiagnosticsBtn", diagnostics],
      ["v13CloudSetupBtn", openCloud],
      ["v13SyncBtn", sync],
      [
        "v13CloseDiagnostics",
        () => {
          $("v13DiagnosticsModal").hidden = true;
        },
      ],
      ["v13RefreshDiagnostics", diagnostics],
      [
        "v13CloseCloud",
        () => {
          $("v13CloudModal").hidden = true;
        },
      ],
      ["v13SaveCloud", saveCloud],
    ];

    for (const [id, handler] of pairs) {
      const element = $(id);

      if (
        element &&
        !element.dataset.v13Bound
      ) {
        element.addEventListener(
          "click",
          handler
        );

        element.dataset.v13Bound = "yes";
      }
    }

    const input = $("v13RestoreFile");

    if (
      input &&
      !input.dataset.v13Bound
    ) {
      input.addEventListener(
        "change",
        (event) =>
          restoreFile(event.target.files?.[0])
      );

      input.dataset.v13Bound = "yes";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      bind
    );
  } else {
    bind();
  }

  window.V13SafetyControls = {
    makeBackup,
    restoreFile,
    diagnostics,
  };
})();
