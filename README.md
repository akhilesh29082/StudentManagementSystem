# StudentHub — Student Management System

A responsive JavaScript web application for managing student records. This project demonstrates JavaScript arrays, objects, JSON, DOM manipulation, events, form validation, CRUD operations, search/filter/sort, and browser localStorage.

## How to run

1. Extract the ZIP file.
2. Open the `StudentManagementSystem` folder.
3. Double-click `index.html` to open it in Chrome, Edge, or Firefox.
4. Add student details using the form. Records are saved in that browser.
5. Use **Export JSON** to download your records as a `.json` file.

No server, database, framework, or package installation is required.

## Features

- Add, view, edit, and delete student records.
- Validate all required fields before saving.
- Validate name, unique PRN, email, and marks between 0 and 100.
- Store student records in an array of JavaScript objects.
- Use `JSON.stringify()` to save the array and `JSON.parse()` to load it.
- Save data in browser `localStorage` so it persists after refresh.
- Search across student name, PRN, email, department, and year.
- Filter by department and sort by name or marks.
- Show student count, department count, and average marks.
- Export student records to a JSON file.
- Responsive UI for desktop, tablet, and mobile screens.
- Escape displayed user input to reduce HTML injection risks.

## Project files

- `index.html` — application structure and form/table.
- `style.css` — responsive layout and visual styling.
- `script.js` — validation, JSON/array handling, CRUD, search, filters, and localStorage.

## JavaScript concepts to explain in a viva

1. **Array:** `students` holds all student objects.
2. **Object:** Each student is represented by properties such as `name`, `prn`, `email`, and `marks`.
3. **JSON.stringify():** Converts the array of objects to a JSON string for storage/export.
4. **JSON.parse():** Converts stored JSON text back into JavaScript data.
5. **localStorage:** Saves data in the current browser across page refreshes.
6. **DOM manipulation:** Updates the table, statistics, and messages dynamically.
7. **Events:** Form submission, input search, select changes, and table button clicks trigger JavaScript functions.
8. **Validation:** Invalid data is rejected before it is added to the array or saved.
9. **CRUD:** Create, Read, Update, and Delete are implemented.
10. **Error handling:** `try...catch` handles invalid saved JSON and storage/export errors.

## Notes

- This is a front-end demonstration. Records are stored only in the current browser profile, not on a shared server.
- Clearing browser site data can remove saved records. Use **Export JSON** to keep a backup.
- The example shown in the side panel is illustrative; the app does not automatically insert sample records.
