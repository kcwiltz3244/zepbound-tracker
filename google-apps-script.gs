const PRIVATE_SYNC_KEY = "REPLACE_WITH_YOUR_PRIVATE_KEY";
const SHEET_NAME = "Zepbound Data";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");

    if (data.syncKey !== PRIVATE_SYNC_KEY) {
      return jsonResponse({ ok: false, message: "Invalid sync key" });
    }

    if (data.action === "test") {
      return jsonResponse({ ok: true, message: "Connection successful" });
    }

    if (data.action !== "addEntry" || !data.entry) {
      return jsonResponse({ ok: false, message: "Invalid request" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Record ID","Date","Weight","Waist","Dose","Injection Site","Injection Taken",
        "Systolic","Diastolic","Glucose","A1C","Water oz","Protein g","Exercise Days",
        "Sleep Hours","Appetite","Pens Remaining","Refill Date","Goal Weight",
        "Side Effects","Notes","Received At"
      ]);
      sheet.setFrozenRows(1);
    }

    const entry = data.entry;
    const ids = sheet.getLastRow() > 1
      ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().flat()
      : [];

    if (ids.includes(entry.id)) {
      return jsonResponse({ ok: true, duplicate: true });
    }

    sheet.appendRow([
      entry.id || "",
      entry.date || "",
      entry.weight || "",
      entry.waist || "",
      entry.dose || "",
      entry.site || "",
      entry.injectionTaken || "",
      entry.systolic || "",
      entry.diastolic || "",
      entry.glucose || "",
      entry.a1c || "",
      entry.water || "",
      entry.protein || "",
      entry.exercise || "",
      entry.sleep || "",
      entry.appetite || "",
      entry.pensRemaining || "",
      entry.refillDate || "",
      entry.goalWeight || "",
      (entry.sideEffects || []).join(", "),
      entry.notes || "",
      new Date()
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, message: error.message });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}