/* =========================================================
   AI DevFest 2026
   Tender Document Package Builder
   Frontend-only application
   ========================================================= */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const { PDFDocument, StandardFonts, rgb } = PDFLib;

/* -------------------------
   Application state
------------------------- */

let tenderData = null;
let requirements = [];
let uploadedFiles = [];
let matches = {};
let expiryDates = {};
let currentLanguage = "en";
let fileCounter = 0;

const MAX_FILES = 30;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024;

/* -------------------------
   DOM references
------------------------- */

const requirementsInput = document.getElementById("requirementsInput");
const pdfInput = document.getElementById("pdfInput");

const requirementsMessage = document.getElementById("requirementsMessage");
const uploadMessage = document.getElementById("uploadMessage");
const generateMessage = document.getElementById("generateMessage");

const tenderSection = document.getElementById("tenderSection");
const checklistSection = document.getElementById("checklistSection");
const packageStatusSection = document.getElementById("packageStatusSection");
const generateSection = document.getElementById("generateSection");
const exportSection = document.getElementById("exportSection");
const uploadedFilesSection = document.getElementById("uploadedFilesSection");

const uploadedFilesList = document.getElementById("uploadedFilesList");
const requirementsTableBody = document.getElementById("requirementsTableBody");

const tenderIdValue = document.getElementById("tenderIdValue");
const tenderTitleValue = document.getElementById("tenderTitleValue");
const procuringEntityValue = document.getElementById("procuringEntityValue");
const bidderValue = document.getElementById("bidderValue");
const deadlineValue = document.getElementById("deadlineValue");

const totalCount = document.getElementById("totalCount");
const okCount = document.getElementById("okCount");
const blockingCount = document.getElementById("blockingCount");
const packageStatusMessage = document.getElementById("packageStatusMessage");

const generateBtn = document.getElementById("generateBtn");
const csvBtn = document.getElementById("csvBtn");

const englishBtn = document.getElementById("englishBtn");
const banglaBtn = document.getElementById("banglaBtn");

/* -------------------------
   Translation dictionary
------------------------- */

const translations = {
  en: {
    appTitle: "Tender Document Package Builder",
    appSubtitle: "Check, organize and generate a complete tender PDF package.",
    loadRequirements: "Load Tender Requirements",
    loadRequirementsHelp: "Select the requirements.json file provided with the tender.",
    chooseRequirements: "Choose requirements.json",
    tenderInformation: "Tender Information",
    tenderId: "Tender ID",
    tenderTitle: "Tender Title",
    procuringEntity: "Procuring Entity",
    bidder: "Bidder",
    submissionDeadline: "Submission Deadline",
    uploadDocuments: "Upload Tender Documents",
    uploadDocumentsHelp: "Upload up to 30 PDF files. Maximum combined size: 50 MB.",
    choosePdfs: "Choose PDF files",
    uploadedFiles: "Uploaded Files",
    documentChecklist: "Document Checklist",
    documentChecklistHelp: "Match each uploaded PDF with the correct tender requirement.",
    order: "Order",
    document: "Document",
    required: "Required",
    matchedFile: "Matched File",
    expiryDate: "Expiry Date",
    status: "Status",
    packageStatus: "Package Status",
    totalDocuments: "Total",
    okDocuments: "OK",
    blockingIssues: "Blocking",
    generatePackage: "Generate Tender Package",
    generateHelp: "The button becomes available when all blocking issues are resolved.",
    generateButton: "Generate Combined PDF",
    exportChecklist: "Export Checklist",
    downloadCsv: "Download CSV",
    privacyNote: "Your documents stay in your browser and are not uploaded to a server.",

    requiredYes: "Mandatory",
    requiredNo: "Optional",
    noFile: "— No file —",
    pages: "pages",
    remove: "Remove",
    duplicate: "Duplicate content",

    missing: "Missing",
    expiryNeeded: "Expiry date needed",
    expired: "Expired",
    notProvided: "Not provided",
    ok: "OK",

    requirementsLoaded: "Tender requirements loaded successfully.",
    invalidJson: "Could not read this requirements file. Please choose a valid requirements.json file.",
    invalidStructure: "The JSON file does not contain the required tender and requirements data.",

    fileLimit: "Maximum 30 PDF files are allowed.",
    sizeLimit: "The combined uploaded PDF size cannot exceed 50 MB.",
    notPdf: "Rejected because it is not a PDF:",
    badPdf: "Could not read this PDF. It may be damaged or password-protected:",
    filesAdded: "PDF files processed successfully.",

    blocked: "The package cannot be generated yet. Resolve all blocking issues.",
    ready: "All blocking issues are resolved. The package is ready to generate.",
    generating: "Generating combined PDF...",
    generated: "Combined PDF generated successfully.",
    generationFailed: "Could not generate the PDF package.",

    duplicateMatch:
      "Files with identical content cannot be matched to different documents.",

    csvDownloaded: "Checklist CSV downloaded."
  },

  bn: {
    appTitle: "টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার",
    appSubtitle: "টেন্ডারের নথি যাচাই, সাজানো এবং সম্পূর্ণ PDF প্যাকেজ তৈরি করুন।",
    loadRequirements: "টেন্ডারের প্রয়োজনীয় তালিকা লোড করুন",
    loadRequirementsHelp: "টেন্ডারের সাথে দেওয়া requirements.json ফাইলটি নির্বাচন করুন।",
    chooseRequirements: "requirements.json নির্বাচন করুন",
    tenderInformation: "টেন্ডারের তথ্য",
    tenderId: "টেন্ডার আইডি",
    tenderTitle: "টেন্ডারের শিরোনাম",
    procuringEntity: "ক্রয়কারী প্রতিষ্ঠান",
    bidder: "দরদাতা",
    submissionDeadline: "জমাদানের শেষ তারিখ",
    uploadDocuments: "টেন্ডার ডকুমেন্ট আপলোড করুন",
    uploadDocumentsHelp: "সর্বোচ্চ ৩০টি PDF এবং মোট ৫০ MB পর্যন্ত আপলোড করা যাবে।",
    choosePdfs: "PDF ফাইল নির্বাচন করুন",
    uploadedFiles: "আপলোড করা ফাইল",
    documentChecklist: "ডকুমেন্ট চেকলিস্ট",
    documentChecklistHelp: "প্রতিটি PDF সঠিক টেন্ডার প্রয়োজনীয়তার সাথে মিলিয়ে দিন।",
    order: "ক্রম",
    document: "ডকুমেন্ট",
    required: "প্রয়োজনীয়তা",
    matchedFile: "মিলানো ফাইল",
    expiryDate: "মেয়াদ শেষের তারিখ",
    status: "অবস্থা",
    packageStatus: "প্যাকেজের অবস্থা",
    totalDocuments: "মোট",
    okDocuments: "ঠিক আছে",
    blockingIssues: "সমস্যা",
    generatePackage: "টেন্ডার প্যাকেজ তৈরি করুন",
    generateHelp: "সব বাধাদানকারী সমস্যা সমাধান হলে বাটনটি সক্রিয় হবে।",
    generateButton: "সমন্বিত PDF তৈরি করুন",
    exportChecklist: "চেকলিস্ট এক্সপোর্ট",
    downloadCsv: "CSV ডাউনলোড করুন",
    privacyNote: "আপনার ডকুমেন্ট ব্রাউজারেই থাকে এবং কোনো সার্ভারে আপলোড হয় না।",

    requiredYes: "বাধ্যতামূলক",
    requiredNo: "ঐচ্ছিক",
    noFile: "— কোনো ফাইল নেই —",
    pages: "পৃষ্ঠা",
    remove: "মুছুন",
    duplicate: "একই কনটেন্টের ফাইল",

    missing: "অনুপস্থিত",
    expiryNeeded: "মেয়াদ শেষের তারিখ প্রয়োজন",
    expired: "মেয়াদোত্তীর্ণ",
    notProvided: "দেওয়া হয়নি",
    ok: "ঠিক আছে",

    requirementsLoaded: "টেন্ডারের প্রয়োজনীয় তালিকা সফলভাবে লোড হয়েছে।",
    invalidJson: "requirements.json ফাইলটি পড়া যায়নি। সঠিক JSON ফাইল নির্বাচন করুন।",
    invalidStructure: "JSON ফাইলে প্রয়োজনীয় tender এবং requirements তথ্য নেই।",

    fileLimit: "সর্বোচ্চ ৩০টি PDF ফাইল আপলোড করা যাবে।",
    sizeLimit: "সব PDF মিলিয়ে সর্বোচ্চ ৫০ MB হতে পারবে।",
    notPdf: "PDF নয় বলে ফাইলটি বাতিল করা হয়েছে:",
    badPdf: "PDF ফাইলটি পড়া যায়নি। ফাইলটি নষ্ট বা পাসওয়ার্ড-সুরক্ষিত হতে পারে:",
    filesAdded: "PDF ফাইল সফলভাবে প্রক্রিয়া করা হয়েছে।",

    blocked: "প্যাকেজ এখনো তৈরি করা যাবে না। সব বাধাদানকারী সমস্যা সমাধান করুন।",
    ready: "সব বাধাদানকারী সমস্যা সমাধান হয়েছে। এখন প্যাকেজ তৈরি করা যাবে।",
    generating: "সমন্বিত PDF তৈরি হচ্ছে...",
    generated: "সমন্বিত PDF সফলভাবে তৈরি হয়েছে।",
    generationFailed: "PDF প্যাকেজ তৈরি করা যায়নি।",

    duplicateMatch:
      "একই কনটেন্টের ফাইল আলাদা ডকুমেন্টে ব্যবহার করা যাবে না।",

    csvDownloaded: "চেকলিস্ট CSV ডাউনলোড হয়েছে।"
  }
};

/* -------------------------
   Utility functions
------------------------- */

function t(key) {
  return translations[currentLanguage][key] || key;
}

function showMessage(element, text, type = "info") {
  element.textContent = text;
  element.className = `message ${type}`;
}

function hideMessage(element) {
  element.className = "message hidden";
  element.textContent = "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTotalUploadSize() {
  return uploadedFiles.reduce((sum, item) => sum + item.file.size, 0);
}

function getFileById(id) {
  return uploadedFiles.find(item => item.id === id);
}

function getRequirementById(id) {
  return requirements.find(req => req.id === id);
}

function getMatchedFile(requirementId) {
  const fileId = matches[requirementId];
  return fileId ? getFileById(fileId) : null;
}

function isPdf(file) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

async function calculateHash(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);

  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getPdfPageCount(file) {
  const buffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer)
  });

  const pdf = await loadingTask.promise;
  const pages = pdf.numPages;

  await pdf.destroy();

  return pages;
}

function refreshDuplicateFlags() {
  const counts = {};

  uploadedFiles.forEach(item => {
    counts[item.hash] = (counts[item.hash] || 0) + 1;
  });

  uploadedFiles.forEach(item => {
    item.duplicate = counts[item.hash] > 1;
  });
}

function sameContentAlreadyMatched(file, currentRequirementId) {
  return Object.entries(matches).some(([requirementId, matchedFileId]) => {
    if (requirementId === currentRequirementId) return false;

    const matchedFile = getFileById(matchedFileId);

    return matchedFile && matchedFile.hash === file.hash;
  });
}

function fileAlreadyMatchedElsewhere(fileId, currentRequirementId) {
  return Object.entries(matches).some(
    ([requirementId, matchedFileId]) =>
      requirementId !== currentRequirementId &&
      matchedFileId === fileId
  );
}

/* -------------------------
   Language switching
------------------------- */

function applyLanguage() {
  document.documentElement.lang =
    currentLanguage === "bn" ? "bn" : "en";

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    element.textContent = t(key);
  });

  englishBtn.classList.toggle("active", currentLanguage === "en");
  banglaBtn.classList.toggle("active", currentLanguage === "bn");

  renderUploadedFiles();
  renderRequirements();
  updatePackageStatus();
}

englishBtn.addEventListener("click", () => {
  currentLanguage = "en";
  applyLanguage();
});

banglaBtn.addEventListener("click", () => {
  currentLanguage = "bn";
  applyLanguage();
});

/* -------------------------
   Load requirements.json
------------------------- */

requirementsInput.addEventListener("change", async event => {
  hideMessage(requirementsMessage);

  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (
      !parsed.tender ||
      !parsed.tender.tender_id ||
      !parsed.tender.submission_deadline ||
      !Array.isArray(parsed.requirements)
    ) {
      throw new Error("INVALID_STRUCTURE");
    }

    tenderData = parsed.tender;

    requirements = [...parsed.requirements].sort(
      (a, b) => Number(a.order) - Number(b.order)
    );

    matches = {};
    expiryDates = {};

    tenderIdValue.textContent = tenderData.tender_id || "—";
    tenderTitleValue.textContent = tenderData.title || "—";
    procuringEntityValue.textContent =
      tenderData.procuring_entity || "—";
    bidderValue.textContent = tenderData.bidder || "—";
    deadlineValue.textContent =
      tenderData.submission_deadline || "—";

    tenderSection.classList.remove("hidden");
    checklistSection.classList.remove("hidden");
    packageStatusSection.classList.remove("hidden");
    generateSection.classList.remove("hidden");
    exportSection.classList.remove("hidden");

    showMessage(
      requirementsMessage,
      t("requirementsLoaded"),
      "success"
    );

    renderRequirements();
    updatePackageStatus();
  } catch (error) {
    console.error(error);

    showMessage(
      requirementsMessage,
      error.message === "INVALID_STRUCTURE"
        ? t("invalidStructure")
        : t("invalidJson"),
      "error"
    );
  }
});

/* -------------------------
   Upload PDF files
------------------------- */

pdfInput.addEventListener("change", async event => {
  hideMessage(uploadMessage);

  const selectedFiles = Array.from(event.target.files || []);

  if (!selectedFiles.length) return;

  if (uploadedFiles.length + selectedFiles.length > MAX_FILES) {
    showMessage(uploadMessage, t("fileLimit"), "error");
    pdfInput.value = "";
    return;
  }

  const incomingSize = selectedFiles.reduce(
    (sum, file) => sum + file.size,
    0
  );

  if (getTotalUploadSize() + incomingSize > MAX_TOTAL_SIZE) {
    showMessage(uploadMessage, t("sizeLimit"), "error");
    pdfInput.value = "";
    return;
  }

  const errors = [];
  let added = 0;

  for (const file of selectedFiles) {
    if (!isPdf(file)) {
      errors.push(`${t("notPdf")} ${file.name}`);
      continue;
    }

    try {
      const hash = await calculateHash(file);
      const pages = await getPdfPageCount(file);

      uploadedFiles.push({
        id: `file-${++fileCounter}`,
        file,
        pages,
        hash,
        duplicate: false
      });

      added++;
    } catch (error) {
      console.error(error);
      errors.push(`${t("badPdf")} ${file.name}`);
    }
  }

  refreshDuplicateFlags();

  if (added > 0) {
    uploadedFilesSection.classList.remove("hidden");
  }

  renderUploadedFiles();
  renderRequirements();
  updatePackageStatus();

  if (errors.length) {
    showMessage(
      uploadMessage,
      errors.join(" "),
      "warning"
    );
  } else if (added > 0) {
    showMessage(
      uploadMessage,
      t("filesAdded"),
      "success"
    );
  }

  pdfInput.value = "";
});

/* -------------------------
   Render uploaded files
------------------------- */

function renderUploadedFiles() {
  uploadedFilesList.innerHTML = "";

  if (!uploadedFiles.length) {
    uploadedFilesSection.classList.add("hidden");
    return;
  }

  uploadedFilesSection.classList.remove("hidden");

  uploadedFiles.forEach(item => {
    const card = document.createElement("div");
    card.className = "file-card";

    const duplicateHtml = item.duplicate
      ? `<span class="duplicate-badge">${escapeHtml(
          t("duplicate")
        )}</span>`
      : "";

    card.innerHTML = `
      <div class="file-main">
        <span class="file-name">${escapeHtml(item.file.name)}</span>

        <span class="file-meta">
          ${item.pages} ${escapeHtml(t("pages"))}
          · ${escapeHtml(formatBytes(item.file.size))}
        </span>

        ${duplicateHtml}
      </div>

      <span class="file-meta">
        SHA-256: ${escapeHtml(item.hash.slice(0, 10))}…
      </span>

      <button
        type="button"
        class="remove-btn"
        data-file-id="${escapeHtml(item.id)}"
      >
        ${escapeHtml(t("remove"))}
      </button>
    `;

    uploadedFilesList.appendChild(card);
  });

  uploadedFilesList
    .querySelectorAll(".remove-btn")
    .forEach(button => {
      button.addEventListener("click", () => {
        removeUploadedFile(button.dataset.fileId);
      });
    });
}

function removeUploadedFile(fileId) {
  uploadedFiles = uploadedFiles.filter(
    item => item.id !== fileId
  );

  Object.keys(matches).forEach(requirementId => {
    if (matches[requirementId] === fileId) {
      delete matches[requirementId];
      delete expiryDates[requirementId];
    }
  });

  refreshDuplicateFlags();
  renderUploadedFiles();
  renderRequirements();
  updatePackageStatus();
}

/* -------------------------
   Requirement status rules
------------------------- */

function calculateRequirementStatus(requirement) {
  const matchedFile = getMatchedFile(requirement.id);

  if (!matchedFile) {
    if (requirement.mandatory) {
      return {
        key: "missing",
        label: t("missing"),
        className: "status-missing",
        blocking: true
      };
    }

    return {
      key: "notProvided",
      label: t("notProvided"),
      className: "status-optional",
      blocking: false
    };
  }

  if (requirement.has_expiry) {
    const expiry = expiryDates[requirement.id];

    if (!expiry) {
      return {
        key: "expiryNeeded",
        label: t("expiryNeeded"),
        className: "status-expiry",
        blocking: true
      };
    }

    if (expiry < tenderData.submission_deadline) {
      return {
        key: "expired",
        label: t("expired"),
        className: "status-expired",
        blocking: true
      };
    }
  }

  return {
    key: "ok",
    label: t("ok"),
    className: "status-ok",
    blocking: false
  };
}

/* -------------------------
   Render checklist table
------------------------- */

function renderRequirements() {
  requirementsTableBody.innerHTML = "";

  if (!requirements.length) return;

  requirements.forEach(requirement => {
    const row = document.createElement("tr");

    const selectedFileId = matches[requirement.id] || "";
    const status = calculateRequirementStatus(requirement);

    const title =
      currentLanguage === "bn"
        ? requirement.title_bn
        : requirement.title_en;

    const fileOptions = uploadedFiles
      .map(item => {
        const usedElsewhere =
          fileAlreadyMatchedElsewhere(
            item.id,
            requirement.id
          );

        const duplicateConflict =
          sameContentAlreadyMatched(
            item,
            requirement.id
          );

        const disabled =
          usedElsewhere || duplicateConflict;

        const selected =
          selectedFileId === item.id;

        return `
          <option
            value="${escapeHtml(item.id)}"
            ${selected ? "selected" : ""}
            ${disabled && !selected ? "disabled" : ""}
          >
            ${escapeHtml(item.file.name)}
            (${item.pages} ${escapeHtml(t("pages"))})
            ${item.duplicate ? "⚠" : ""}
          </option>
        `;
      })
      .join("");

    const expiryInput = requirement.has_expiry
      ? `
        <input
          type="date"
          class="expiry-input"
          data-requirement-id="${escapeHtml(requirement.id)}"
          value="${escapeHtml(expiryDates[requirement.id] || "")}"
          ${selectedFileId ? "" : "disabled"}
        />
      `
      : "—";

    row.innerHTML = `
      <td>${escapeHtml(requirement.order)}</td>

      <td>
        <strong>${escapeHtml(title)}</strong>
        <div class="file-meta">
          ${escapeHtml(requirement.id)}
        </div>
      </td>

      <td>
        <span class="${
          requirement.mandatory
            ? "required-label"
            : "optional-label"
        }">
          ${escapeHtml(
            requirement.mandatory
              ? t("requiredYes")
              : t("requiredNo")
          )}
        </span>
      </td>

      <td>
        <select
          class="match-select"
          data-requirement-id="${escapeHtml(requirement.id)}"
        >
          <option value="">
            ${escapeHtml(t("noFile"))}
          </option>

          ${fileOptions}
        </select>
      </td>

      <td>
        ${expiryInput}
      </td>

      <td>
        <span class="status-badge ${status.className}">
          ${escapeHtml(status.label)}
        </span>
      </td>
    `;

    requirementsTableBody.appendChild(row);
  });

  requirementsTableBody
    .querySelectorAll(".match-select")
    .forEach(select => {
      select.addEventListener("change", event => {
        handleMatchChange(
          event.target.dataset.requirementId,
          event.target.value
        );
      });
    });

  requirementsTableBody
    .querySelectorAll(".expiry-input")
    .forEach(input => {
      input.addEventListener("change", event => {
        const requirementId =
          event.target.dataset.requirementId;

        expiryDates[requirementId] =
          event.target.value;

        renderRequirements();
        updatePackageStatus();
      });
    });
}

function handleMatchChange(requirementId, fileId) {
  hideMessage(uploadMessage);

  if (!fileId) {
    delete matches[requirementId];
    delete expiryDates[requirementId];

    renderRequirements();
    updatePackageStatus();
    return;
  }

  const file = getFileById(fileId);

  if (!file) return;

  if (
    fileAlreadyMatchedElsewhere(
      fileId,
      requirementId
    ) ||
    sameContentAlreadyMatched(
      file,
      requirementId
    )
  ) {
    showMessage(
      uploadMessage,
      t("duplicateMatch"),
      "error"
    );

    renderRequirements();
    updatePackageStatus();
    return;
  }

  matches[requirementId] = fileId;

  const requirement =
    getRequirementById(requirementId);

  if (!requirement.has_expiry) {
    delete expiryDates[requirementId];
  }

  renderRequirements();
  updatePackageStatus();
}

/* -------------------------
   Package status
------------------------- */

function updatePackageStatus() {
  if (!requirements.length || !tenderData) return;

  const statuses =
    requirements.map(calculateRequirementStatus);

  const ok =
    statuses.filter(status => status.key === "ok")
      .length;

  const blocking =
    statuses.filter(status => status.blocking)
      .length;

  totalCount.textContent = requirements.length;
  okCount.textContent = ok;
  blockingCount.textContent = blocking;

  generateBtn.disabled = blocking > 0;

  if (blocking > 0) {
    packageStatusMessage.textContent =
      `${t("blocked")} (${blocking})`;

    packageStatusMessage.style.color =
      "#b91c1c";
  } else {
    packageStatusMessage.textContent =
      t("ready");

    packageStatusMessage.style.color =
      "#15803d";
  }
}

/* -------------------------
   Generate combined PDF
------------------------- */

generateBtn.addEventListener("click", async () => {
  if (!tenderData || !requirements.length) return;

  const statuses =
    requirements.map(calculateRequirementStatus);

  if (statuses.some(status => status.blocking)) {
    showMessage(
      generateMessage,
      t("blocked"),
      "error"
    );
    return;
  }

  generateBtn.disabled = true;

  showMessage(
    generateMessage,
    t("generating"),
    "info"
  );

  try {
    const outputPdf =
      await PDFDocument.create();

    const font =
      await outputPdf.embedFont(
        StandardFonts.Helvetica
      );

    const boldFont =
      await outputPdf.embedFont(
        StandardFonts.HelveticaBold
      );

    const includedRequirements =
      requirements.filter(
        requirement =>
          Boolean(getMatchedFile(requirement.id))
      );

    /* Cover page */

    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;

    const cover =
      outputPdf.addPage([
        A4_WIDTH,
        A4_HEIGHT
      ]);

    cover.drawText(
      "Tender Document Package",
      {
        x: 48,
        y: 780,
        size: 22,
        font: boldFont,
        color: rgb(0.08, 0.17, 0.38)
      }
    );

    cover.drawText(
      `Tender ID: ${tenderData.tender_id}`,
      {
        x: 48,
        y: 730,
        size: 12,
        font
      }
    );

    cover.drawText(
      `Tender Title: ${tenderData.title}`,
      {
        x: 48,
        y: 708,
        size: 12,
        font
      }
    );

    cover.drawText(
      `Procuring Entity: ${tenderData.procuring_entity}`,
      {
        x: 48,
        y: 686,
        size: 12,
        font
      }
    );

    cover.drawText(
      `Bidder: ${tenderData.bidder}`,
      {
        x: 48,
        y: 664,
        size: 12,
        font
      }
    );

    cover.drawText(
      `Submission Deadline: ${tenderData.submission_deadline}`,
      {
        x: 48,
        y: 642,
        size: 12,
        font
      }
    );

    const packageDate =
      new Date().toISOString().slice(0, 10);

    cover.drawText(
      `Package Made: ${packageDate}`,
      {
        x: 48,
        y: 620,
        size: 12,
        font
      }
    );

    cover.drawText(
      "Included Documents",
      {
        x: 48,
        y: 576,
        size: 15,
        font: boldFont
      }
    );

    let listY = 548;

    includedRequirements.forEach(
      requirement => {
        const file =
          getMatchedFile(requirement.id);

        const line =
          `${requirement.order}. ${requirement.title_en} — ${file.file.name}`;

        cover.drawText(line, {
          x: 58,
          y: listY,
          size: 10,
          font,
          maxWidth: 480
        });

        listY -= 22;
      }
    );

    /* Add tender documents in required order */

    const FOOTER_MARGIN = 28;

    for (const requirement of includedRequirements) {
      const matchedFile =
        getMatchedFile(requirement.id);

      const bytes =
        await matchedFile.file.arrayBuffer();

      const sourcePdf =
        await PDFDocument.load(bytes);

      for (
        let pageIndex = 0;
        pageIndex < sourcePdf.getPageCount();
        pageIndex++
      ) {
        const sourcePage =
          sourcePdf.getPage(pageIndex);

        const embeddedPage =
          await outputPdf.embedPage(
            sourcePage
          );

        const sourceWidth =
          sourcePage.getWidth();

        const sourceHeight =
          sourcePage.getHeight();

        const newPage =
          outputPdf.addPage([
            sourceWidth,
            sourceHeight + FOOTER_MARGIN
          ]);

        newPage.drawPage(
          embeddedPage,
          {
            x: 0,
            y: FOOTER_MARGIN,
            width: sourceWidth,
            height: sourceHeight
          }
        );
      }
    }

    /* Footer on every page */

    const allPages =
      outputPdf.getPages();

    const totalPages =
      allPages.length;

    allPages.forEach((page, index) => {
      const footer =
        `${tenderData.tender_id} | Page ${index + 1} of ${totalPages}`;

      const fontSize = 9;

      const textWidth =
        font.widthOfTextAtSize(
          footer,
          fontSize
        );

      page.drawText(
        footer,
        {
          x:
            Math.max(
              12,
              (page.getWidth() - textWidth) / 2
            ),
          y: 9,
          size: fontSize,
          font,
          color: rgb(0.25, 0.25, 0.25)
        }
      );
    });

    const pdfBytes =
      await outputPdf.save();

    const blob =
      new Blob(
        [pdfBytes],
        {
          type: "application/pdf"
        }
      );

    downloadBlob(
      blob,
      `${tenderData.tender_id}_Package.pdf`
    );

    showMessage(
      generateMessage,
      t("generated"),
      "success"
    );
  } catch (error) {
    console.error(error);

    showMessage(
      generateMessage,
      `${t("generationFailed")} ${error.message || ""}`,
      "error"
    );
  } finally {
    updatePackageStatus();
  }
});

/* -------------------------
   CSV export
------------------------- */

csvBtn.addEventListener("click", () => {
  if (!requirements.length) return;

  const header = [
    "Document",
    "File Name",
    "Pages",
    "Expiry Date",
    "Status"
  ];

  const rows = requirements.map(
    requirement => {
      const file =
        getMatchedFile(requirement.id);

      const status =
        calculateRequirementStatus(
          requirement
        );

      return [
        requirement.title_en,
        file ? file.file.name : "",
        file ? file.pages : "",
        expiryDates[requirement.id] || "",
        translations.en[status.key] ||
          status.key
      ];
    }
  );

  const csv =
    [header, ...rows]
      .map(row =>
        row
          .map(value => escapeCsv(value))
          .join(",")
      )
      .join("\n");

  const blob =
    new Blob(
      ["\uFEFF" + csv],
      {
        type:
          "text/csv;charset=utf-8"
      }
    );

  const filename =
    tenderData
      ? `${tenderData.tender_id}_Checklist.csv`
      : "Tender_Checklist.csv";

  downloadBlob(blob, filename);

  showMessage(
    generateMessage,
    t("csvDownloaded"),
    "success"
  );
});

function escapeCsv(value) {
  const text = String(value ?? "");

  return `"${text.replaceAll('"', '""')}"`;
}

function downloadBlob(blob, filename) {
  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/* -------------------------
   Initial UI
------------------------- */

applyLanguage();
