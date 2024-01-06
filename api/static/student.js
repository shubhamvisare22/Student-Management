const baseUrl = "/api/v1/";
const studentsUrl = `${baseUrl}student-list/`;
const subjectsUrl = `${baseUrl}subject-list/`;

let nextPageUrl = null;
let prevPageUrl = null;

$(document).ready(function () {

  fetchStudentData();
  fetchSubjectData();

  async function getSubjectName(subjectId) {
    const subjectUrl = `/api/v1/subject-detail/${subjectId}/`;

    try {
      const subjectData = await $.ajax({
        url: subjectUrl,
        method: "GET",
      });

      return subjectData.name;
    } catch (error) {
      console.error("Error:", error);
      return null; // Or handle the error as needed
    }
  }

  $('#searchInput').on('input', function () {
    const searchText = $(this).val().toLowerCase();
    filterStudents(searchText);
  });

  function filterStudents(searchText) {
    const students = $('#studentTableBody').find('tr');

    students.each(function () {
      const serialNumer = $(this).find('td:eq(0)').text().toLowerCase();
      const studentName = $(this).find('td:eq(1)').text().toLowerCase();
      const studentRoll = $(this).find('td:eq(2)').text().toLowerCase();
      const studentClass = $(this).find('td:eq(3)').text().toLowerCase();

      if (
        studentName.includes(searchText) ||
        studentRoll.includes(searchText) ||
        studentClass.includes(searchText) ||
        serialNumer.includes(searchText)
      ) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  }

  function fetchStudentData(url) {
    $.ajax({
      url: url || studentsUrl,
      method: "GET",
      success: function (response) {
        populateStudentTable(response.results);
        nextPageUrl = response.next;
        prevPageUrl = response.previous;
        updatePaginationButtons();
      },
      error: function (xhr, status, error) {
        console.error(xhr, status, error);
      },
    });
  }

  function updatePaginationButtons() {
    if (nextPageUrl) {
      $("#nextPageBtn").prop("disabled", false);
    } else {
      $("#nextPageBtn").prop("disabled", true);
    }

    if (prevPageUrl) {
      $("#prevPageBtn").prop("disabled", false);
    } else {
      $("#prevPageBtn").prop("disabled", true);
    }
  }

  $("#nextPageBtn").click(function () {
    if (nextPageUrl) {
      fetchStudentData(nextPageUrl);
    }
  });

  $("#prevPageBtn").click(function () {
    if (prevPageUrl) {
      fetchStudentData(prevPageUrl);
    }
  });

  function fetchSubjectData() {
    $.ajax({
      url: subjectsUrl,
      method: "GET",
      success: function (response) {
        populateSubjectsDropdown(response.results);
      },
      error: function (xhr, status, error) {
        console.error(xhr, status, error);
      },
    });
  }

  function populateSubjectsDropdown(subjects) {
    const subjectFields = $("#subjectFields");
    subjectFields.empty();

    for (let i = 1; i <= 5; i++) {
      const dropdown = createSubjectDropdown(subjects, i);
      const scoreInput = createScoreInput(i);
      subjectFields.append(dropdown);
      subjectFields.append(scoreInput);
    }
  }

  function createSubjectDropdown(subjects, index) {
    const dropdown = `
      <div class="form-group">
        <label for="subject${index}">Subject ${index}</label>
        <select class="form-control" id="subject${index}">
          <option value="">Select Subject</option>
          ${subjects.map(subject => `<option value="${subject.id}">${subject.name}</option>`).join('')}
        </select>
      </div>
    `;
    return dropdown;
  }

  function createScoreInput(index) {
    const scoreInput = `
      <div class="form-group">
        <input type="number" class="form-control" id="score${index}" />
      </div>
    `;
    return scoreInput;
  }

  function populateStudentTable(data) {
    const studentTableBody = $("#studentTableBody");
    studentTableBody.empty();

    data.forEach((student, index) => {
      const row = createTableRow(student, index + 1);
      studentTableBody.append(row);
    });

    studentTableBody.on("click", ".btn-primary", function () {
      const studentId = $(this).data("student-id");
      console.log($(this));
      showSubjectScores(studentId);
    });

    studentTableBody.on("click", ".btn-success", function () {
      const studentId = $(this).data("student-id");
      console.log($(this).data("student-id"));
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
        <td>${student.photo ? `<img src="${student.photo.url}" alt="Student Photo" width="50">` : "N/A"}</td>
        <td>
          <button class="btn btn-sm btn-primary action-btn view-btn" data-student-id="${student.id}" title="View Scores">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-success action-btn update-btn" data-student-id="${student.id}" title="Update">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger action-btn delete-btn" data-student-id="${student.id}" title="Delete">
            <i class="fas fa-trash-alt"></i>
          </button>
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

  function showSubjectScores(studentId) {
    const getStudent = `/api/v1/student-detail/${studentId}/`;

    $.ajax({
      url: getStudent,
      method: "GET",
      success: function (response) {
        console.log(`Fetched details for student with ID ${studentId}:`, response);

        let modalBody = $("#subjectScoresModalBody");
        modalBody.empty();
        if (response.subject_scores && response.subject_scores.length > 0) {
          (async () => {
            const listGroup = $('<div class="list-group"></div>');

            for (const [index, score] of response.subject_scores.entries()) {
              const subjectName = await getSubjectName(score.subject);
              const listItem = $(`
                <div class="list-group-item d-flex justify-content-between align-items-center">
                  <span>${subjectName}</span>
                  <span class="badge badge-primary badge-pill ml-3 py-2" style="font-size: 1.2em;">${score.score}</span>
                </div>
              `);
              listGroup.append(listItem);
            }

            modalBody.append(listGroup);
          })();




          // Open the modal when content is ready
          $("#subjectScoresModal").modal("show");
        } else {
          modalBody.append("<p>No subject scores available for this student.</p>");
          $("#subjectScoresModal").modal("show");
        }
      },
      error: function (xhr, status, error) {
        console.error(xhr, status, error);
        // Handle errors if needed
      },
    });
  }


  function populateUpdateForm(studentId) {
    const getStudent = `/api/v1/student-detail/${studentId}/`;

    $("#stuName, #stuRoll, #stuPhoto, #stuclass").val("");
    for (let i = 1; i <= 5; i++) {
      $(`#subject${i}, #score${i}`).val("");
    }
    $("#studentId").remove();

    $.ajax({
      url: getStudent,
      method: "GET",
      success: function (response) {
        console.log(`Fetched details for student with ID ${studentId}:`, response);

        $("#stuName").val(response.name);
        $("#stuRoll").val(response.roll_no);
        if ($("#stuRoll")){
          console.log("Tag available")
        }
        $("#stuclass").val(response.student_class);

        // Populate the student photo if available
        if (response.photo) {
          $("#stuPhoto").attr("src", response.photo.url);
          console.log($("#stuPhoto").attr("src", response.url))
        }

        if (response.subject_scores && response.subject_scores.length > 0) {
          response.subject_scores.forEach((score, index) => {
            const subjectId = score.subject;
            const scoreValue = score.score;
            $(`#subject${index + 1}`).val(subjectId);
            $(`#score${index + 1}`).val(scoreValue);
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


  $("#submitStudentBtn").click(function (event) {
    event.preventDefault();

    const baseUrl = "/api/v1/";
    const createStudentUrl = baseUrl + "student-create/";

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
          subject: parseInt(subject),
          score: parseInt(score),
        };
        subjectScores.push(subjectScore);
      } else {
        toastr.error(`Please enter both subject and score for Subject ${i}`);
        return;
      }
    }

    // formData.append("subject_scores", subjectScores);
    formData.append("subject_scores", JSON.stringify(subjectScores));

    console.log(formData);

    $.ajax({
      url: createStudentUrl,
      method: "POST",
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
          text: "Student created successfully.",
        });
      },
      error: function (xhr, status, error) {
        console.error(xhr);
        console.error(status);
        console.error(error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to create student.",
        });
      },
    });
  });


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
    formData.append("id", studentId);
    formData.append("name", name);
    formData.append("roll_no", roll_no);
    formData.append("stu_cls", stu_cls);
    formData.append("csrfmiddlewaretoken", token);
    formData.append("photo", file);

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
        $("#stuName, #stuRoll, #stuPhoto, #stuclass").val("");
        for (let i = 1; i <= 5; i++) {
          $(`#subject${i}, #score${i}`).val("");
        }
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
