// Function to populate student data in the table
function populateStudents() {
  const baseUrl = "/api/v1/";
  const studentsUrl = `${baseUrl}student-list/`;
  $.ajax({
    url: studentsUrl,
    method: "GET",
    success: function (response) {
      populateStudentTable(response.results);
    },
    error: function (xhr, status, error) {
      console.error(xhr, status, error);
    },
  });
}

// Function to populate student table with data
function populateStudentTable(data) {
  const studentTableBody = $("#studentTableBody");
  studentTableBody.empty();

  data.forEach((student, index) => {
    const row = createTableRow(student, index + 1);
    studentTableBody.append(row);
  });

  // Event listeners for buttons in the student table
  studentTableBody.on("click", ".btn-primary", function () {
    const studentId = $(this).data("student-id");
    // Handle View Scores button click
    // Implement logic to show the scores for the student with ID studentId
    // You can add your functionality here
  });

  studentTableBody.on("click", ".btn-success", function () {
    const studentId = $(this).data("student-id");
    populateUpdateForm(studentId);
    // Handle Update button click
    // Implement logic to populate the form for updating the student with ID studentId
    // You can add your functionality here
  });

  studentTableBody.on("click", ".btn-danger", function () {
    const studentId = $(this).data("student-id");
    deleteStudent(studentId);
    // Handle Delete button click
    // Implement logic to delete the student with ID studentId
    // You can add your functionality here
  });
}

// Function to create table rows for students
function createTableRow(student, index) {
  return `
    <tr id="student-${student.id}">
      <td>${index}</td>
      <td>${student.name}</td>
      <td>${student.roll_no}</td>
      <td>${
        student.photo
          ? `<img src="${student.photo}" alt="Student Photo" width="50">`
          : "N/A"
      }</td>
      <td>
        <button class="btn btn-sm btn-primary" data-student-id="${
          student.id
        }">View Scores</button>
        <button class="btn btn-sm btn-success" data-student-id="${
          student.id
        }">Update</button>
        <button class="btn btn-sm btn-danger" data-student-id="${
          student.id
        }">Delete</button>
      </td>
    </tr>
  `;
}

// Function to populate the update form with student data
function populateUpdateForm(studentId) {
  $.ajax({
    url: `${studentsUrl}${studentId}/`,
    method: "GET",
    success: function (response) {
      // Populate the form fields with student data
      // ...
    },
    error: function (xhr, status, error) {
      console.error(xhr, status, error);
    },
  });
}

// Function to handle form validation for student
function validateStudentForm() {
  const name = $("#stuName").val();
  const roll_no = $("#stuRoll").val();
  const stu_cls = $("#stuclass").val();
  const file = document.getElementById("stuPhoto").files[0];

  if (name === "") {
    return "Please enter the student's name.";
  }

  if (roll_no === "" || roll_no === 0) {
    return "Please enter a valid roll number.";
  }

  if (stu_cls === "" || stu_cls === 0 || stu_cls >= 12) {
    return "Enter the student's class between 1-12.";
  }

  if (!file) {
    return "Please upload the student's photo.";
  }

  const submittedSubjects = new Set();
  const subjectCount = 5;

  for (let i = 1; i <= subjectCount; i++) {
    const selectSubject = $(`#subject${i}`);
    const subject = selectSubject.val();
    const score = $(`#score${i}`).val();

    //   if (subject) {
    //     if (!submittedSubjects.has(subject)) {
    //       submittedSubjects.add(subject);
    //     } else {
    //       return `Please select a unique subject for Subject ${i}`;
    //     }
    //   } else {
    //     return `Please select a subject for Subject ${i}`;
    //   }
  }

  // if (submittedSubjects.size !== subjectCount) {
  //   return "Please add all five unique subjects with scores";
  // }

  return ""; // Return empty string if all validations pass
}

// Function to handle form submission for creating/updating students
function createStudent(formData) {
  const createStudentUrl = `${baseUrl}student-create/`;

  $.ajax({
    url: createStudentUrl,
    method: "POST",
    data: formData,
    contentType: false,
    processData: false,
    success: function (response) {
      // Reset form fields and show success message
      $("#stuName").val("");
      $("#stuRoll").val("");
      $("#stuclass").val("");
      $("#stuPhoto").val("");

      for (let i = 1; i <= 5; i++) {
        $(`#subject${i}`).val("");
        $(`#score${i}`).val("");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Student created successfully.",
      });

      populateStudents(); // Refresh the student table after creating
    },
    error: function (xhr, status, error) {
      // Handle error response
      console.error(xhr, status, error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to create student.",
      });
    },
  });
}

// Function to handle updating a student
function updateStudent(formData, studentId) {
  const updateStudentUrl = `${baseUrl}student-update/${studentId}/`;

  $.ajax({
    url: updateStudentUrl,
    method: "PUT",
    data: formData,
    contentType: false,
    processData: false,
    success: function (response) {
      $("#stuName").val("");
      $("#stuRoll").val("");
      $("#stuclass").val("");
      $("#stuPhoto").val("");

      for (let i = 1; i <= 5; i++) {
        $(`#subject${i}`).val("");
        $(`#score${i}`).val("");
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Student updated successfully.",
      });

      populateStudents();
    },
    error: function (xhr, status, error) {
      // Handle error response
      console.error(xhr, status, error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update student.",
      });
    },
  });
}

// Function to handle deleting a student
function deleteStudent(studentId) {
  const deleteUrl = `${baseUrl}student-delete/${studentId}/`;

  $.ajax({
    url: deleteUrl,
    method: "DELETE",
    success: function (response) {
      console.log(`Student with ID ${studentId} deleted successfully`);
      populateStudents(); // Refresh the student table after deletion
    },
    error: function (xhr, status, error) {
      console.error(xhr, status, error);
    },
  });
}

// Event listener for form submission to create or update student
$("#submitStudentBtn").click(function (event) {
  event.preventDefault();

  const validationMsg = validateStudentForm();

  if (validationMsg !== "") {
    toastr.error(validationMsg);
    return;
  }

  // Collect form data for creating/updating students
  let formData = new FormData();
  // Populate formData with student data (similar to the previous code)

  const studentId = $("#studentId").val();

  if (studentId) {
    // If studentId exists, update the student
    updateStudent(formData, studentId);
  } else {
    // If no studentId exists, create a new student
    createStudent(formData);
  }
});

$(document).ready(function () {
  // Populate student data on document load
  populateStudents();
});
