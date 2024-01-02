$(document).ready(function () {
  function populateStudentTable() {
    const baseUrl = "/api/v1/";
    const studentListUrl = baseUrl + "student-list/";

    // Check if DataTable instance already exists
    if ($.fn.DataTable.isDataTable("#studentTable")) {
      dataTable = $("#studentTable").DataTable();
    } else {
      dataTable = $("#studentTable").DataTable({
        paging: true,
        searching: true,
        // Other DataTable options as needed
      });
    }

    // Use AJAX to fetch student data
    $.ajax({
      url: studentListUrl,
      method: "GET",
      success: function (data) {
        console.log("Received data:", data); // Log received data to console
        const students = data.results; // Extract student data from 'results'

        // Clear previous table data
        dataTable.clear().draw();

        // Add new data to the table with serial numbers
        students.forEach(function (student, index) {
          dataTable.row
            .add([
              index + 1,
              student.name,
              student.roll_no,
              student.student_class,
              `<img src="${student.photo}" alt="Student Photo" width="50" height="50">`,
              "Action Button",
            ])
            .draw();
        });
      },
      error: function (xhr, status, error) {
        console.error(xhr);
        console.error(status);
        console.error(error);
        // Handle error scenario
      },
    });
  }

  populateStudentTable();

  $("#btn").click(function (event) {
    event.preventDefault();

    // Your form submission code...
    // After successful form submission and new record addition via AJAX

    // Assuming `newStudent` contains the newly added student's details
    const newStudent = {
      name: "New Student",
      roll_no: 123,
      student_class: "Class XYZ",
      photo: "new_student_photo.jpg",
    };

    // Add the new student to the DataTable
    dataTable.row
      .add([
        dataTable.data().count() + 1, // Serial number starting from the count of existing rows + 1
        newStudent.name,
        newStudent.roll_no,
        newStudent.student_class,
        `<img src="${newStudent.photo}" alt="Student Photo" width="50" height="50">`,
        "Action Button",
      ])
      .draw(false); // Draw the new row without a full redraw
  });

  $("#btn").click(function (event) {
    event.preventDefault();

    const baseUrl = "/api/v1/";
    const createStudentUrl = baseUrl + "student-create/";

    let name = $("#stuName").val();
    let roll_no = $("#stuRoll").val();
    let fileInput = document.getElementById("stuPhoto");
    let file = fileInput.files[0];
    let token = $("input[name=csrfmiddlewaretoken]").val();

    // Validation checks
    if (name === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter a name.",
      });
    } else if ((roll_no === "") | (roll_no === 0)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter a roll number.",
      });
    } else if (!file) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please upload a student photo.",
      });
    } else {
      let formData = new FormData();
      formData.append("name", name);
      formData.append("roll_no", roll_no);
      formData.append("photo", file);
      formData.append("csrfmiddlewaretoken", token);

      $.ajax({
        url: createStudentUrl,
        method: "POST",
        data: formData,
        contentType: false,
        processData: false,
        enctype: "multipart/form-data",
        success: function (response) {
          $("#stuName").val("");
          $("#stuRoll").val("");
          $("#stuPhoto").val("");

          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Data submitted successfully.",
          });
        },
        error: function (xhr, status, error) {
          console.log(xhr);
          console.log(status);
          console.log(error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to submit data. Please try again.",
          });
        },
      });
    }
  });
});
