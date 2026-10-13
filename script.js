/*
  StudentHub - Student Management System
  Concepts demonstrated: arrays, objects, JSON, DOM manipulation, events,
  validation, CRUD operations, search/filter/sort, and localStorage.
*/
"use strict";

const STORAGE_KEY = "studentHubRecords";
let students = [];
let nextId = 1;

const form = document.getElementById("studentForm");
const formMessage = document.getElementById("formMessage");
const tableMessage = document.getElementById("tableMessage");
const tableBody = document.getElementById("studentTableBody");
const emptyState = document.getElementById("emptyState");
const editingIdInput = document.getElementById("editingId");

function showMessage(element, message, type = "error") {
  element.textContent = message;
  element.className = `message show ${type}`;
}

function hideMessage(element) {
  element.textContent = "";
  element.className = "message";
}

function loadStudents() {
  try {
    const storedJSON = localStorage.getItem(STORAGE_KEY);
    if (!storedJSON) {
      students = [];
      return;
    }

    const parsedData = JSON.parse(storedJSON);
    if (!Array.isArray(parsedData)) {
      throw new Error("Saved data is not an array.");
    }

    // Keep only records with the expected fields to avoid rendering invalid data.
    students = parsedData.filter((student) =>
      student &&
      Number.isInteger(student.id) &&
      typeof student.name === "string" &&
      typeof student.prn === "string" &&
      typeof student.email === "string" &&
      typeof student.department === "string" &&
      typeof student.year === "string" &&
      Number.isFinite(Number(student.marks))
    );
    nextId = students.reduce((maxId, student) => Math.max(maxId, student.id), 0) + 1;
  } catch (error) {
    students = [];
    showMessage(tableMessage, "Saved student data could not be read. The stored data may be corrupted. Add a new record or clear the browser's site data.", "error");
    console.error("Unable to load student records:", error);
  }
}

function saveStudents() {
  try {
    // Convert the array of student objects to JSON before saving.
    const jsonData = JSON.stringify(students);
    localStorage.setItem(STORAGE_KEY, jsonData);
    return true;
  } catch (error) {
    showMessage(formMessage, "Unable to save records in this browser. Check available storage and try again.", "error");
    console.error("Unable to save student records:", error);
    return false;
  }
}

function getFormData() {
  return {
    name: document.getElementById("name").value.trim().replace(/\s+/g, " "),
    prn: document.getElementById("prn").value.trim(),
    email: document.getElementById("email").value.trim(),
    department: document.getElementById("department").value,
    year: document.getElementById("year").value,
    marks: document.getElementById("marks").value.trim()
  };
}

function validateStudent(data, currentId = null) {
  if (!data.name || !data.prn || !data.email || !data.department || !data.year || data.marks === "") {
    return "Please complete all required fields before saving.";
  }
  if (data.name.length < 2 || !/^[\p{L}][\p{L}\s.'-]*$/u.test(data.name)) {
    return "Enter a valid name (at least 2 characters; letters and common name punctuation only).";
  }
  if (!/^[A-Za-z0-9_-]{3,20}$/.test(data.prn)) {
    return "PRN / Student ID must be 3–20 characters and contain only letters, numbers, hyphens, or underscores.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
    return "Enter a valid email address, for example student@example.com.";
  }
  const marks = Number(data.marks);
  if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
    return "Marks must be a number between 0 and 100.";
  }
  if (!Number.isInteger(marks * 100)) {
    return "Marks can have a maximum of two decimal places.";
  }
  const duplicate = students.some((student) =>
    student.prn.toLowerCase() === data.prn.toLowerCase() && student.id !== currentId
  );
  if (duplicate) {
    return "This PRN / Student ID already exists. Enter a unique ID.";
  }
  return "";
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function renderStats() {
  document.getElementById("totalStudents").textContent = students.length;
  const departments = new Set(students.map((student) => student.department));
  document.getElementById("totalDepartments").textContent = departments.size;
  const average = students.length
    ? students.reduce((sum, student) => sum + Number(student.marks), 0) / students.length
    : null;
  document.getElementById("averageMarks").textContent = average === null ? "—" : average.toFixed(1);
}

function renderDepartmentFilter() {
  const filter = document.getElementById("departmentFilter");
  const currentValue = filter.value;
  const departments = [...new Set(students.map((student) => student.department))].sort();
  filter.innerHTML = '<option value="">All departments</option>' +
    departments.map((department) => `<option value="${escapeHTML(department)}">${escapeHTML(department)}</option>`).join("");
  if (departments.includes(currentValue)) filter.value = currentValue;
}

function getVisibleStudents() {
  const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
  const selectedDepartment = document.getElementById("departmentFilter").value;
  const sortType = document.getElementById("sortSelect").value;

  const visible = students.filter((student) => {
    const searchable = `${student.name} ${student.prn} ${student.email} ${student.department} ${student.year}`.toLowerCase();
    return searchable.includes(searchTerm) &&
      (!selectedDepartment || student.department === selectedDepartment);
  });

  visible.sort((a, b) => {
    if (sortType === "name") return a.name.localeCompare(b.name);
    if (sortType === "marksHigh") return Number(b.marks) - Number(a.marks);
    if (sortType === "marksLow") return Number(a.marks) - Number(b.marks);
    return b.id - a.id;
  });
  return visible;
}

function renderStudents() {
  const visibleStudents = getVisibleStudents();
  tableBody.innerHTML = visibleStudents.map((student) => {
    const initials = student.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    return `<tr>
      <td><div class="student-cell"><div class="student-avatar">${escapeHTML(initials)}</div><div><div class="student-name">${escapeHTML(student.name)}</div><div class="student-email">${escapeHTML(student.email)}</div></div></div></td>
      <td><span class="prn-tag">${escapeHTML(student.prn)}</span></td>
      <td><span class="department-tag">${escapeHTML(student.department)}</span></td>
      <td>${escapeHTML(student.year)}</td>
      <td><span class="marks-chip">${Number(student.marks).toFixed(2).replace(/\.00$/, "")}%</span></td>
      <td><div class="action-buttons">
        <button class="icon-button" type="button" data-action="edit" data-id="${student.id}" aria-label="Edit ${escapeHTML(student.name)}">Edit</button>
        <button class="icon-button delete" type="button" data-action="delete" data-id="${student.id}" aria-label="Delete ${escapeHTML(student.name)}">Delete</button>
      </div></td>
    </tr>`;
  }).join("");

  emptyState.classList.toggle("visible", visibleStudents.length === 0);
  document.getElementById("tableCount").textContent = visibleStudents.length;
  document.getElementById("resultSummary").textContent =
    `Showing ${visibleStudents.length} of ${students.length} student${students.length === 1 ? "" : "s"}`;
  renderStats();
  renderDepartmentFilter();
}

function resetFormState() {
  form.reset();
  editingIdInput.value = "";
  document.getElementById("formTitle").textContent = "Add new student";
  document.getElementById("saveButton").textContent = "Save student";
  document.getElementById("cancelEditButton").classList.add("hidden");
  hideMessage(formMessage);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  hideMessage(formMessage);

  const data = getFormData();
  const currentId = editingIdInput.value ? Number(editingIdInput.value) : null;
  const validationError = validateStudent(data, currentId);
  if (validationError) {
    showMessage(formMessage, validationError, "error");
    return; // Invalid data is never saved.
  }

  const studentRecord = {
    id: currentId || nextId++,
    name: data.name,
    prn: data.prn,
    email: data.email,
    department: data.department,
    year: data.year,
    marks: Number(data.marks),
    updatedAt: new Date().toISOString()
  };

  if (currentId) {
    const index = students.findIndex((student) => student.id === currentId);
    if (index === -1) {
      showMessage(formMessage, "This student record no longer exists. Refresh the list and try again.", "error");
      return;
    }
    students[index] = studentRecord;
  } else {
    students.push(studentRecord);
  }

  if (!saveStudents()) {
    // Re-read persisted data if the browser could not save the change.
    loadStudents();
    renderStudents();
    return;
  }

  const successText = currentId ? "Student record updated successfully." : "Student added successfully.";
  resetFormState();
  showMessage(formMessage, successText, "success");
  renderStudents();
});

document.getElementById("cancelEditButton").addEventListener("click", resetFormState);
document.getElementById("resetButton").addEventListener("click", () => {
  // The reset event fires after the browser resets the fields.
  setTimeout(() => {
    if (editingIdInput.value) resetFormState();
    else hideMessage(formMessage);
  }, 0);
});

tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const student = students.find((item) => item.id === id);
  if (!student) {
    showMessage(tableMessage, "That student record could not be found. Refresh the page and try again.", "error");
    return;
  }

  if (button.dataset.action === "edit") {
    document.getElementById("name").value = student.name;
    document.getElementById("prn").value = student.prn;
    document.getElementById("email").value = student.email;
    document.getElementById("department").value = student.department;
    document.getElementById("year").value = student.year;
    document.getElementById("marks").value = student.marks;
    editingIdInput.value = student.id;
    document.getElementById("formTitle").textContent = "Update student";
    document.getElementById("saveButton").textContent = "Update student";
    document.getElementById("cancelEditButton").classList.remove("hidden");
    hideMessage(formMessage);
    document.getElementById("student-form").scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (button.dataset.action === "delete") {
    const confirmed = window.confirm(`Delete the record for ${student.name} (${student.prn})? This action cannot be undone.`);
    if (!confirmed) return;
    const previousStudents = students;
    students = students.filter((item) => item.id !== id);
    if (!saveStudents()) {
      students = previousStudents;
      renderStudents();
      return;
    }
    if (Number(editingIdInput.value) === id) resetFormState();
    hideMessage(tableMessage);
    renderStudents();
    showMessage(tableMessage, "Student record deleted successfully.", "success");
  }
});

document.getElementById("searchInput").addEventListener("input", renderStudents);
document.getElementById("departmentFilter").addEventListener("change", renderStudents);
document.getElementById("sortSelect").addEventListener("change", renderStudents);

document.getElementById("exportButton").addEventListener("click", () => {
  if (students.length === 0) {
    showMessage(tableMessage, "There are no student records to export yet.", "error");
    return;
  }
  try {
    // Export a formatted JSON file containing the student array.
    const json = JSON.stringify(students, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const downloadURL = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadURL;
    link.download = "student-records.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadURL);
    showMessage(tableMessage, "Student records exported as JSON successfully.", "success");
  } catch (error) {
    showMessage(tableMessage, "JSON export failed. Please try again.", "error");
    console.error("JSON export failed:", error);
  }
});

// JSON.parse() converts the stored JSON string back into an array on startup.
loadStudents();
renderStudents();
