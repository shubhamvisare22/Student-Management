const baseUrl = "/api/v1/";
const studentsUrl = `${baseUrl}student-list/`;
const subjectsUrl = `${baseUrl}subject-list/`;
$(document).ready(function () {
  // Fetch student data
  fetchStudentData();
  // fetchSubjectData();

  function fetchStudentData() {
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

  function fetchSubjectData() {
    $.ajax({
      url: subjectsUrl,
      method: "GET",
      success: function (response) {},
      error: function (xhr, status, error) {
        console.error(xhr, status, error);
      },
    });
  }

  function populateStudentTable(data) {
    const studentTableBody = $("#studentTableBody");
    studentTableBody.empty();

    data.forEach((student, index) => {
      const row = createTableRow(student, index + 1);
      studentTableBody.append(row);
    });

    // Event listener for buttons in the table
    studentTableBody.on("click", ".btn-primary", function () {
      const studentId = $(this).data("student-id");
      showSubjectScores(studentId);
    });

    studentTableBody.on("click", ".btn-success", function () {
      const studentId = $(this).data("student-id");
      populateUpdateForm(studentId);
    });

    studentTableBody.on("click", ".btn-danger", function () {
      const studentId = $(this).data("student-id");
      deleteStudent(studentId);
    });
  }

  function createTableRow(student, index) {
    return `
        <tr>
          <td>${index}</td>
          <td>${student.name}</td>
          <td>${student.roll_no}</td>
          <td>${
            student.photo
              ? `<img src="${student.photo.url}" alt="Student Photo" width="50">`
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

  function toggleUpdateButtonVisibility(studentId) {
    if (studentId) {
      $("#updateStudentBtn").show(); // Show the update button if studentId exists
    } else {
      $("#updateStudentBtn").hide(); // Hide the update button if studentId is not available
    }
  }

  function populateUpdateForm(studentId) {
    getStudent = `/api/v1/student-detail/${studentId}/`;

    $.ajax({
      url: getStudent,
      method: "GET",
      success: function (response) {
        console.log(
          `Fetched details for student with ID ${studentId}:`,
          response
        );

        // Populate the form fields with the retrieved student data
        $("#stuName").val(response.name);
        $("#stuRoll").val(response.roll_no);
        $("#stuclass").val(response.student_class);

        // Populate the student photo if available
        if (response.photo) {
          $("#stuPhoto").attr("src", response.photo);
        }

        // Populate subject scores (if available)
        if (response.subject_scores && response.subject_scores.length > 0) {
          response.subject_scores.forEach((score) => {
            const subjectId = score.subject;
            const scoreValue = score.score;

            // Assuming the IDs are formatted as `subject${subjectId}` and `score${subjectId}`
            $(`#subject${subjectId - 1}`).val(subjectId); // Populate subject select field
            $(`#score${subjectId - 1}`).val(scoreValue); // Populate score input field
          });
        }
        const hiddenStudentIdField = `<input type="hidden" id="studentId" name="studentId" value="${studentId}" />`;
        $("#studentForm").append(hiddenStudentIdField);
        toggleUpdateButtonVisibility(studentId);
      },

      error: function (xhr, status, error) {
        console.error(xhr, status, error);
      },
    });
  }

  // populateUpdateForm();

  $("#updateStudentBtn").click(function (event) {
    event.preventDefault();

    const studentId = $("#studentId").val();
    const baseUrl = "/api/v1/";
    const updateStudentUrl = baseUrl + `student-update/${studentId}/`;

    let name = $("#stuName").val();
    let roll_no = $("#stuRoll").val();
    let stu_cls = $("#stuclass").val();
    let fileInput = document.getElementById("stuPhoto");
    let file = fileInput.files[0];
    let token = $("input[name=csrfmiddlewaretoken]").val();

    if (
      name === "" ||
      roll_no === "" ||
      roll_no === 0 ||
      stu_cls === "" ||
      stu_cls === 0 ||
      stu_cls >= 12 ||
      !file
    ) {
      toastr.error("Please enter valid data for all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("id", studentId); // Include the student ID for the update
    formData.append("name", name);
    formData.append("roll_no", roll_no);
    formData.append("photo", file);
    formData.append("stu_cls", stu_cls);
    formData.append("csrfmiddlewaretoken", token);

    const subjectScores = [];

    for (let i = 1; i <= 5; i++) {
      const subject = $(`#subject${i}`).val();
      const score = $(`#score${i}`).val();

      if (subject && score) {
        const subjectScore = {
          subject: subject,
          score: score,
          student: studentId,
        };
        subjectScores.push(subjectScore);
      } else {
        toastr.error(`Please enter both subject and score for Subject ${i}`);
        return;
      }
    }

    formData.append("subject_scores", JSON.stringify(subjectScores));

    console.log(formData);

    $.ajax({
      url: updateStudentUrl,
      method: "PUT",
      data: formData,
      contentType: false,
      processData: false,
      enctype: "multipart/form-data",
      success: function (response) {
        $("#stuName, #stuRoll, #stuPhoto, #stuclass").val("");
        for (let i = 1; i <= 5; i++) {
          $(`#subject${i}, #score${i}`).val("");
        }
        fetchStudentData();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Data updated successfully.",
        });
      },
      error: function (xhr, status, error) {
        console.error(xhr);
        console.error(status);
        console.error(error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update student data.",
        });
      },
    });
  });

  $("#submitStudentBtn").click(function (event) {
    event.preventDefault();

    const studentId = $("#studentId").val();
    const baseUrl = "/api/v1/";
    const updateStudentUrl = baseUrl + `student-update/${studentId}/`;

    let name = $("#stuName").val();
    let roll_no = $("#stuRoll").val();
    let stu_cls = $("#stuclass").val();
    let fileInput = document.getElementById("stuPhoto");
    let file = fileInput.files[0];
    let token = $("input[name=csrfmiddlewaretoken]").val();

    if (
      name === "" ||
      roll_no === "" ||
      roll_no === 0 ||
      stu_cls === "" ||
      stu_cls === 0 ||
      stu_cls >= 12 ||
      !file
    ) {
      toastr.error("Please enter valid data for all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("id", studentId); // Include the student ID for the update
    formData.append("name", name);
    formData.append("roll_no", roll_no);
    formData.append("photo", file);
    formData.append("stu_cls", stu_cls);
    formData.append("csrfmiddlewaretoken", token);

    const subjectScores = [];

    for (let i = 1; i <= 5; i++) {
      const subject = $(`#subject${i}`).val();
      const score = $(`#score${i}`).val();

      if (subject && score) {
        const subjectScore = {
          subject: subject,
          score: score,
          student: studentId,
        };
        subjectScores.push(subjectScore);
      } else {
        toastr.error(`Please enter both subject and score for Subject ${i}`);
        return;
      }
    }

    formData.append("subject_scores", JSON.stringify(subjectScores));

    console.log(formData);

    $.ajax({
      url: updateStudentUrl,
      method: "PUT",
      data: formData,
      contentType: false,
      processData: false,
      enctype: "multipart/form-data",
      success: function (response) {
        $("#stuName, #stuRoll, #stuPhoto, #stuclass").val("");
        for (let i = 1; i <= 5; i++) {
          $(`#subject${i}, #score${i}`).val("");
        }
        fetchStudentData();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Data updated successfully.",
        });
      },
      error: function (xhr, status, error) {
        console.error(xhr);
        console.error(status);
        console.error(error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update student data.",
        });
      },
    });
  });

  function deleteStudent(studentId) {
    const deleteUrl = `/api/v1/student-delete/${studentId}/`;

    const deletedRow = $(`#student-${studentId}`);

    $.ajax({
      url: deleteUrl,
      method: "DELETE",
      success: function (response) {
        console.log(`Student with ID ${studentId} deleted successfully`);
        fetchStudentData();

        deletedRow.fadeOut("slow", function () {
          $(this).remove();
        });
      },
      error: function (xhr, status, error) {
        console.error(xhr, status, error);
      },
    });
  }
});
