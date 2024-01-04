const baseUrl = "/api/v1/";
const studentsUrl = `${baseUrl}student-list/`;

$(document).ready(function () {
  const studentTableBody = $("#studentTableBody");
  const updateStudentBtn = $("#updateStudentBtn");
  const submitStudentBtn = $("#submitStudentBtn");
  const studentForm = $("#studentForm");

  fetchStudentData();

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

  function populateStudentTable(data) {
    studentTableBody.empty();
    data.forEach((student, index) => {
      const row = createTableRow(student, index + 1);
      studentTableBody.append(row);
    });
    attachTableEventListeners();
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

  function attachTableEventListeners() {
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

  function showSubjectScores(studentId) {
    const studentScoresUrl = `${baseUrl}student-scores/${studentId}`;

    $.ajax({
      url: studentScoresUrl,
      method: "GET",
      success: function (response) {
        if (
          response &&
          response.subject_scores &&
          response.subject_scores.length > 0
        ) {
          displaySubjectScoresModal(response.subject_scores);
        } else {
          toastr.info("No subject scores available for this student.");
        }
      },
      error: function (xhr, status, error) {
        console.error(xhr, status, error);
        toastr.error("Failed to fetch subject scores.");
      },
    });
  }

  function displaySubjectScoresModal(scores) {
    const modalBody = $("#subjectScoresModalBody");
    modalBody.empty();

    scores.forEach((score) => {
      modalBody.append(
        `<p>Subject: ${score.subject}, Score: ${score.score}</p>`
      );
    });

    // Show the modal
    $("#subjectScoresModal").modal("show");
  }

  function handleStudentFormSubmission(update = false) {
    const studentId = $("#studentId").val();
    const updateStudentUrl = `${baseUrl}student-update/${studentId}/`;

    const name = $("#stuName").val();
    const roll_no = $("#stuRoll").val();
    const stu_cls = $("#stuclass").val();
    const fileInput = document.getElementById("stuPhoto");
    const file = fileInput.files[0];
    const token = $("input[name=csrfmiddlewaretoken]").val();

    // Validation
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
    formData.append("id", studentId);
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
      url: update ? updateStudentUrl : studentsUrl,
      method: update ? "PUT" : "POST",
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
  }

  updateStudentBtn.click(function (event) {
    event.preventDefault();
    handleStudentFormSubmission(true);
  });

  submitStudentBtn.click(function (event) {
    event.preventDefault();
    handleStudentFormSubmission();
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
